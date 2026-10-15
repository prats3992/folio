import { ToolHeader } from "@/components/tool-header"
import type { Metadata } from "next"
import { NewChatForm } from "@/components/interview/new-chat-form"
import { getResumeOptions } from "@/lib/queries"
import { requireUser } from "@/lib/session"

export const metadata: Metadata = { title: "New conversation" }

export default async function NewChatPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; resumeId?: string }>
}) {
  const user = await requireUser()
  const params = await searchParams
  const options = await getResumeOptions(user.id)
  const resumeId = options.some((o) => o.id === params.resumeId) ? params.resumeId! : user.primaryResumeId
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <ToolHeader eyebrow="Interview prep" title="Start a conversation." />
      <NewChatForm
        options={options}
        defaultKind={params.kind === "mock_interview" ? "mock_interview" : "general"}
        defaultResumeId={resumeId ?? null}
      />
    </div>
  )
}
