import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db, schema } from "@/lib/db"
import { model } from "@/lib/ai/models"
import { fence, SYSTEM } from "@/lib/ai/prompts"
import { consumeAiQuota, QuotaExceededError } from "@/lib/ai/quota"
import { RateLimitError } from "@/lib/rate-limit"
import { titleFromMessage } from "@/lib/ai/tasks"
import { appendMessages, getOwnedChat, loadMessages, textOf } from "@/lib/chat/store"
import { normalizeResume, resumeToText } from "@/lib/resume/schema"

export const maxDuration = 120

const MAX_HISTORY = 40

const bodySchema = z.object({
  id: z.string().min(1).max(64),
  message: z.object({
    id: z.string().min(1).max(64),
    role: z.literal("user"),
    parts: z
      .array(z.object({ type: z.literal("text"), text: z.string().trim().min(1).max(4000) }))
      .min(1)
      .max(1),
  }),
})

const json = (error: string, status: number) => Response.json({ error }, { status })

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return json("Please log in again.", 401)

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return json("Messages are limited to 4,000 characters.", 400)
  const { id: chatId, message } = parsed.data

  const chat = await getOwnedChat(session.user.id, chatId)
  if (!chat) return json("Chat not found.", 404)

  const [user] = await db.select().from(schema.user).where(eq(schema.user.id, session.user.id))
  let refund: () => Promise<void>
  try {
    refund = await consumeAiQuota(user)
  } catch (error) {
    if (error instanceof QuotaExceededError || error instanceof RateLimitError) return json(error.message, 429)
    throw error
  }

  const previous = await loadMessages(chatId)
  const userMessage: UIMessage = message
  const messages = [...previous, userMessage]

  // Ground the conversation in the chat's resume (or the user's primary resume).
  const resumeId = chat.resumeId ?? user.primaryResumeId
  let resumeContext = ""
  if (resumeId) {
    const [r] = await db.select().from(schema.resume).where(eq(schema.resume.id, resumeId))
    if (r && r.userId === user.id) {
      resumeContext = `\n\nThe user's resume (target role: ${r.targetRole || "unspecified"}):\n${fence("resume", resumeToText(normalizeResume(r.data)))}`
    }
  }
  const system =
    (chat.kind === "mock_interview" ? SYSTEM.mockInterview(chat.meta.targetRole ?? "") : SYSTEM.chat) + resumeContext

  const result = streamText({
    model: model("chat"),
    system,
    messages: await convertToModelMessages(messages.slice(-MAX_HISTORY)),
    maxOutputTokens: 3000,
    temperature: chat.kind === "mock_interview" ? 0.7 : 0.5,
    maxRetries: 2,
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
      onError: (error) => {
        console.error("[chat] stream error", error)
        return "The AI model is busy right now. Please try again in a moment."
      },
      onEnd: async ({ responseMessage, isAborted }) => {
        // Only persist (and only charge for) a turn once the assistant actually answered.
        if (isAborted || !textOf(responseMessage).trim()) {
          await refund().catch(() => {})
          return
        }
        await appendMessages(chatId, [userMessage, responseMessage])
        const isFirstTurn = previous.length === 0
        await db
          .update(schema.chat)
          .set({
            updatedAt: new Date(),
            ...(isFirstTurn && chat.kind === "general" ? { title: titleFromMessage(textOf(userMessage)) } : {}),
          })
          .where(eq(schema.chat.id, chatId))
      },
    }),
  })
}
