import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { ChatView } from "@/components/interview/chat-view"
import { getOwnedChat, loadMessages } from "@/lib/chat/store"
import { db, schema } from "@/lib/db"
import { requireUser } from "@/lib/session"

export const metadata: Metadata = { title: "Interview coach" }

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const user = await requireUser()
  const chat = await getOwnedChat(user.id, (await params).chatId)
  if (!chat) notFound()
  const [messages, resume] = await Promise.all([
    loadMessages(chat.id),
    (async () => {
      const id = chat.resumeId ?? user.primaryResumeId
      if (!id) return null
      const [r] = await db.select({ title: schema.resume.title, userId: schema.resume.userId }).from(schema.resume).where(eq(schema.resume.id, id))
      return r && r.userId === user.id ? r : null
    })(),
  ])
  return (
    <ChatView
      key={chat.id}
      chatId={chat.id}
      kind={chat.kind}
      title={chat.title}
      resumeTitle={resume?.title ?? null}
      initialMessages={messages}
    />
  )
}
