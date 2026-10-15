import "server-only"

// Resume upload handling. Files are parsed in memory and discarded — never written to disk, never
// stored, never sent to a third party (only the extracted text goes to the model).

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"] as const

const MAX_PDF_PAGES = 10
const MAX_DOCX_UNCOMPRESSED = 30 * 1024 * 1024 // zip-bomb guard
const MAX_DOCX_ENTRIES = 2_000
const PARSE_TIMEOUT_MS = 15_000
const MAX_TEXT_CHARS = 30_000

export class ExtractError extends Error {}

type Kind = "pdf" | "docx" | "txt"

/** Decides the type from the file's bytes (magic numbers); the client's name/MIME type must agree. */
function sniff(bytes: Uint8Array, name: string): Kind {
  const ext = name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1]
  const startsWith = (sig: number[]) => sig.every((b, i) => bytes[i] === b)
  if (startsWith([0x25, 0x50, 0x44, 0x46, 0x2d])) {
    if (ext !== "pdf") throw new ExtractError("The file's contents don't match its extension.")
    return "pdf"
  }
  if (startsWith([0x50, 0x4b, 0x03, 0x04])) {
    if (ext !== "docx") throw new ExtractError("Only .docx Word files are supported (not other zip files).")
    return "docx"
  }
  if (ext === "txt") return "txt"
  if (ext === "pdf") throw new ExtractError("That file is not a valid PDF.")
  if (ext === "docx") throw new ExtractError("That file is not a valid Word document.")
  throw new ExtractError("Unsupported file type. Upload a PDF, DOCX or TXT file.")
}

/** Reads the zip central directory and rejects archives that would expand into something huge. */
function assertSafeZip(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  // find the End Of Central Directory record (signature 0x06054b50) in the last 64 KB
  let eocd = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65_557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new ExtractError("That Word document looks corrupted.")
  const entries = view.getUint16(eocd + 10, true)
  let offset = view.getUint32(eocd + 16, true)
  if (entries > MAX_DOCX_ENTRIES) throw new ExtractError("That Word document is too complex to process.")
  let total = 0
  for (let n = 0; n < entries; n++) {
    if (offset + 46 > bytes.length || view.getUint32(offset, true) !== 0x02014b50) {
      throw new ExtractError("That Word document looks corrupted.")
    }
    total += view.getUint32(offset + 24, true) // uncompressed size
    if (total > MAX_DOCX_UNCOMPRESSED) throw new ExtractError("That Word document is too large once unpacked.")
    offset += 46 + view.getUint16(offset + 28, true) + view.getUint16(offset + 30, true) + view.getUint16(offset + 32, true)
  }
}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout>
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new ExtractError("Reading that file took too long. Try exporting a simpler PDF.")), PARSE_TIMEOUT_MS)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function parse(kind: Kind, bytes: Uint8Array): Promise<string> {
  switch (kind) {
    case "pdf": {
      const { extractText, getDocumentProxy } = await import("unpdf")
      // Text extraction only — nothing is rendered. The bundled pdf.js has no eval-based font
      // compilation path (the CVE-2024-4367 vector), and fonts are never loaded as FontFace.
      const pdf = await getDocumentProxy(bytes, { disableFontFace: true })
      if (pdf.numPages > MAX_PDF_PAGES) throw new ExtractError(`Resume PDFs are limited to ${MAX_PDF_PAGES} pages.`)
      return (await extractText(pdf, { mergePages: true })).text
    }
    case "docx": {
      assertSafeZip(bytes)
      const mammoth = await import("mammoth")
      return (await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value
    }
    case "txt":
      try {
        return new TextDecoder("utf-8", { fatal: true }).decode(bytes)
      } catch {
        throw new ExtractError("That text file isn't valid UTF-8 text.")
      }
  }
}

/** Extracts plain text from an uploaded resume after validating size, type and structure. */
export async function extractResumeText(file: File): Promise<string> {
  if (file.size === 0) throw new ExtractError("The file is empty.")
  if (file.size > MAX_UPLOAD_BYTES) throw new ExtractError("File is too large (max 5 MB).")

  const bytes = new Uint8Array(await file.arrayBuffer())
  const kind = sniff(bytes, file.name)
  let text: string
  try {
    text = await withTimeout(parse(kind, bytes))
  } catch (error) {
    if (error instanceof ExtractError) throw error
    console.error("[extract] parse failed", error)
    throw new ExtractError("We couldn't read that file. Try saving it again as a PDF.")
  }

  text = text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "") // control characters
    .replace(/[​-‏‪-‮⁦-⁩]/g, "") // zero-width & bidi overrides (hidden-text tricks)
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
  if (text.length < 50) {
    throw new ExtractError("Couldn't read any text from that file. If it's a scanned PDF, export it as a text PDF and try again.")
  }
  return text.slice(0, MAX_TEXT_CHARS)
}
