import { ToolHeader } from "@/components/tool-header"
import type { Metadata } from "next"
import { ResumeRenderer } from "@/components/resume-templates"
import { NewResumeForm } from "@/components/resume/new-resume-form"
import { ScaledPreview } from "@/components/resume/scaled-preview"
import { SAMPLE_RESUME } from "@/lib/resume/sample"
import { isTemplateId, TEMPLATES } from "@/lib/resume/templates"

export const metadata: Metadata = { title: "New resume" }
// resume parsing on free models can take a while
export const maxDuration = 120

export default async function NewResumePage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const { template } = await searchParams
  const previews = Object.fromEntries(
    TEMPLATES.map((t) => [
      t.id,
      <ScaledPreview key={t.id} ratio={1.15} className="pointer-events-none">
        <ResumeRenderer template={t.id} data={SAMPLE_RESUME} />
      </ScaledPreview>,
    ]),
  )
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <ToolHeader
        eyebrow="New resume"
        title="Start from what you have."
        lede="Upload your current resume — we'll structure it, tailor every bullet to your target role and lay it out in your template."
      />
      <NewResumeForm initialTemplate={isTemplateId(template) ? template : "classic"} previews={previews} />
    </main>
  )
}
