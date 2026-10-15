import "server-only"
import { and, asc, desc, eq } from "drizzle-orm"
import type { UIMessage } from "ai"
import { db, schema } from "@/lib/db"

export async function getOwnedChat(userId: string, chatId: string) {
  const [row] = await db
    .select()
    .from(schema.chat)
    .where(and(eq(schema.chat.id, chatId), eq(schema.chat.userId, userId)))
  return row ?? null
}

export async function loadMessages(chatId: string): Promise<UIMessage[]> {
  const rows = await db
    .select()
    .from(schema.message)
    .where(eq(schema.message.chatId, chatId))
    .orderBy(asc(schema.message.createdAt))
  return rows.map((r) => ({ id: r.id, role: r.role, parts: r.parts }))
}

/** Appends messages; already-stored ids are ignored, so retries can't duplicate rows. */
export async function appendMessages(chatId: string, messages: UIMessage[]) {
  if (!messages.length) return
  const base = Date.now()
  await db
    .insert(schema.message)
    .values(
      messages.map((m, i) => ({
        id: m.id,
        chatId,
        role: m.role,
        parts: m.parts,
        // keep insertion order stable even within the same millisecond
        createdAt: new Date(base + i),
      })),
    )
    .onConflictDoNothing({ target: schema.message.id })
}

export async function listChats(userId: string) {
  return db
    .select({
      id: schema.chat.id,
      title: schema.chat.title,
      kind: schema.chat.kind,
      updatedAt: schema.chat.updatedAt,
    })
    .from(schema.chat)
    .where(eq(schema.chat.userId, userId))
    .orderBy(desc(schema.chat.updatedAt))
    .limit(100)
}

export const textOf = (m: Pick<UIMessage, "parts">) =>
  m.parts.map((p) => (p.type === "text" ? p.text : "")).join("")
