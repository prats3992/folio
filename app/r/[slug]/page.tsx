import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ResumeRenderer } from "@/components/resume-templates"
import { ScaledPreview } from "@/components/resume/scaled-preview"
import { getPublicResume } from "@/lib/queries"
import { SITE } from "@/lib/site"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resume = await getPublicResume((await params).slug)
  if (!resume) return { title: "Resume not found" }
  const p = resume.data.personalInfo
  return {
    title: `${p.name || "Resume"}${p.role ? ` — ${p.role}` : ""}`,
    description: p.summary || undefined,
    robots: { index: false },
  }
}

export default async function PublicResumePage({ params }: Props) {
  const resume = await getPublicResume((await params).slug)
  if (!resume) notFound()
  return (
    <main className="min-h-dvh bg-muted/40 px-3 py-6 sm:px-6 sm:py-10 print:bg-white print:p-0">
      <div className="print-area mx-auto max-w-[816px] overflow-hidden rounded-sm shadow-[0_24px_48px_-28px_rgb(40_30_10/0.45)]">
        <ScaledPreview interactive>
          <ResumeRenderer template={resume.template} data={resume.data} />
        </ScaledPreview>
      </div>
      <p className="no-print mt-6 text-center text-xs text-muted-foreground">
        Made with{" "}
        <Link href="/" className="text-primary hover:underline">
          {SITE.name}
        </Link>
      </p>
    </main>
  )
}
