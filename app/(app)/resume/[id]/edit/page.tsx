import type { Metadata } from "next"
import { toEditor } from "@/components/resume/editor/form-model"
import { ResumeEditor } from "@/components/resume/editor/resume-editor"
import { getOwnedResumeOr404 } from "@/lib/queries"
import { isTemplateId } from "@/lib/resume/templates"
import { requireUser } from "@/lib/session"

export const metadata: Metadata = { title: "Edit resume" }

export default async function EditResumePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const r = await getOwnedResumeOr404(user.id, (await params).id)
  const initial = toEditor(
    { title: r.title, targetRole: r.targetRole, template: isTemplateId(r.template) ? r.template : "minimal" },
    r.data,
  )
  return <ResumeEditor id={r.id} initial={initial} />
}
