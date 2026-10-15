"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import { z } from "zod"
import { db, schema } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { withAiQuota } from "@/lib/ai/quota"
import { LIMITS, rateLimit } from "@/lib/rate-limit"
import { reviewResume } from "@/lib/ai/tasks"
import { appendMessages, getOwnedChat } from "@/lib/chat/store"
import { normalizeResume, resumeToText } from "@/lib/resume/schema"
import { run, UserError } from "@/lib/actions/result"

async function ownedResumeOrNull(userId: string, resumeId: string | null | undefined) {
  if (!resumeId) return null
  const [r] = await db
    .select()
    .from(schema.resume)
    .where(and(eq(schema.resume.id, resumeId), eq(schema.resume.userId, userId)))
  if (!r) throw new UserError("Resume not found.")
  return r
}

export async function createChat(input: { kind?: "general" | "mock_interview"; resumeId?: string | null; targetRole?: string }) {
  return run(async () => {
    const user = await requireUser()
    await rateLimit(`create-chat:${user.id}`, LIMITS.createChat)
    const kind = input.kind ?? "general"
    const resume = await ownedResumeOrNull(user.id, input.resumeId ?? user.primaryResumeId)
    const targetRole = z
      .string()
      .trim()
      .max(120)
      .parse(input.targetRole || resume?.targetRole || "")
    const [row] = await db
      .insert(schema.chat)
      .values({
        userId: user.id,
        resumeId: resume?.id ?? null,
        kind,
        title: kind === "mock_interview" ? `Mock interview${targetRole ? ` — ${targetRole}` : ""}` : "New chat",
        meta: { targetRole },
      })
      .returning({ id: schema.chat.id })
    revalidatePath("/interview", "layout")
    return { id: row.id }
  })
}

export async function renameChat(chatId: string, title: string) {
  return run(async () => {
    const user = await requireUser()
    await rateLimit(`mutation:${user.id}`, LIMITS.mutation)
    if (!(await getOwnedChat(user.id, chatId))) throw new UserError("Chat not found.")
    const value = z.string().trim().min(1, "Title can't be empty.").max(80).parse(title)
    await db.update(schema.chat).set({ title: value }).where(eq(schema.chat.id, chatId))
    revalidatePath("/interview", "layout")
  })
}

export async function deleteChat(chatId: string) {
  return run(async () => {
    const user = await requireUser()
    await rateLimit(`mutation:${user.id}`, LIMITS.mutation)
    await db.delete(schema.chat).where(and(eq(schema.chat.id, chatId), eq(schema.chat.userId, user.id)))
    revalidatePath("/interview", "layout")
  })
}

/** Runs an AI resume review and stores it as a chat, so the user can ask follow-up questions. */
export async function startResumeReview(resumeId: string) {
  return run(async () => {
    const user = await requireUser()
    const resume = await ownedResumeOrNull(user.id, resumeId)
    if (!resume) throw new UserError("Choose a resume to review.")
    await rateLimit(`create-chat:${user.id}`, LIMITS.createChat)
    const review = await withAiQuota(user, () =>
      reviewResume({ resumeText: resumeToText(normalizeResume(resume.data)), targetRole: resume.targetRole }),
    )
    const [row] = await db
      .insert(schema.chat)
      .values({
        userId: user.id,
        resumeId: resume.id,
        kind: "resume_review",
        title: `Resume review — ${resume.targetRole || resume.title}`.slice(0, 80),
        meta: { targetRole: resume.targetRole },
      })
      .returning({ id: schema.chat.id })
    await appendMessages(row.id, [
      {
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", text: `Please review my resume "${resume.title}" for a ${resume.targetRole || "general"} role.` }],
      },
      { id: crypto.randomUUID(), role: "assistant", parts: [{ type: "text", text: review }] },
    ])
    revalidatePath("/interview", "layout")
    return { id: row.id }
  })
}
