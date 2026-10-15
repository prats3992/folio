import type { Metadata } from "next"
import { ResumeRenderer } from "@/components/resume-templates"
import { ResumeToolbar } from "@/components/resume/resume-toolbar"
import { ScaledPreview } from "@/components/resume/scaled-preview"
import { getOwnedResumeOr404 } from "@/lib/queries"
import { requireUser } from "@/lib/session"

export const metadata: Metadata = { title: "Resume" }

export default async function ResumePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const resume = await getOwnedResumeOr404(user.id, (await params).id)

  return (
    <>
      <ResumeToolbar id={resume.id} template={resume.template} isPublic={resume.isPublic} shareSlug={resume.shareSlug} />
      <main className="bg-muted/40 px-3 py-6 sm:px-6 sm:py-10 print:bg-white print:p-0">
        <p className="no-print mx-auto mb-3 max-w-[816px] text-xs text-muted-foreground">
          Tip: in the print dialog choose “Save as PDF”, and turn on “Background graphics” for coloured templates.
        </p>
        <div className="print-area mx-auto max-w-[816px] overflow-hidden rounded-sm shadow-[0_24px_48px_-28px_rgb(40_30_10/0.45)]">
          <ScaledPreview interactive>
            <ResumeRenderer template={resume.template} data={resume.data} />
          </ScaledPreview>
        </div>
      </main>
    </>
  )
}
