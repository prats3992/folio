import { ToolHeader } from "@/components/tool-header"
import type { Metadata } from "next"
import { ReviewForm } from "@/components/interview/review-form"
import { getResumeOptions } from "@/lib/queries"
import { requireUser } from "@/lib/session"

export const metadata: Metadata = { title: "Resume review" }
export const maxDuration = 120

export default async function ReviewPage() {
  const user = await requireUser()
  const options = await getResumeOptions(user.id)
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <ToolHeader eyebrow="Interview prep · Review" title="A recruiter's read of your resume." lede="Strengths, gaps for your target role, line-level rewrites and ATS tips. It opens as a chat so you can ask follow-ups." />
      <ReviewForm options={options} defaultResumeId={user.primaryResumeId} />
    </div>
  )
}
