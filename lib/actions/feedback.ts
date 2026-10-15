"use server"

import { revalidatePath } from "next/cache"
import { and, eq, gt } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { feedbackSchema, type FeedbackInput } from "@/lib/feedback/schema"
import { run, UserError } from "@/lib/actions/result"

export async function submitFeedback(input: FeedbackInput) {
  return run(async () => {
    const user = await requireUser()
    const values = feedbackSchema.parse(input)
    const since = new Date(Date.now() - 60 * 60 * 1000)
    const recent = await db
      .select({ id: schema.feedback.id })
      .from(schema.feedback)
      .where(and(eq(schema.feedback.userId, user.id), gt(schema.feedback.createdAt, since)))
    if (recent.length >= 3) throw new UserError("Thanks! You've sent a lot of feedback recently — try again later.")
    await db.insert(schema.feedback).values({ ...values, userId: user.id })
    revalidatePath("/blog")
  })
}
