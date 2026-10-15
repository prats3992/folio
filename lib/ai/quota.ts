import "server-only"
import { and, eq, sql } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import { getPlan } from "@/lib/plans"
import { LIMITS, rateLimit } from "@/lib/rate-limit"

export class QuotaExceededError extends Error {
  constructor(public limit: number) {
    super(`Daily AI limit reached (${limit} requests). It resets at midnight UTC — or switch plans on the dashboard.`)
    this.name = "QuotaExceededError"
  }
}

type QuotaUser = { id: string; plan: string }

/**
 * Checks every AI limit, then atomically counts one request against today's per-user quota:
 * burst (per minute) → global daily cap (protects the shared key) → plan's daily quota.
 * Returns a refund function to call if the model request then fails.
 */
export async function consumeAiQuota(user: QuotaUser): Promise<() => Promise<void>> {
  await rateLimit(`ai-burst:${user.id}`, LIMITS.aiBurst)
  await rateLimit("ai-global", LIMITS.aiGlobalDaily)

  const limit = getPlan(user.plan).dailyAiLimit
  const [row] = await db
    .insert(schema.aiUsage)
    .values({ userId: user.id, count: 1 })
    .onConflictDoUpdate({
      target: [schema.aiUsage.userId, schema.aiUsage.day],
      set: { count: sql`${schema.aiUsage.count} + 1` },
    })
    .returning({ count: schema.aiUsage.count, day: schema.aiUsage.day })

  const refund = async () => {
    await db
      .update(schema.aiUsage)
      .set({ count: sql`greatest(${schema.aiUsage.count} - 1, 0)` })
      .where(and(eq(schema.aiUsage.userId, user.id), eq(schema.aiUsage.day, row.day)))
  }

  if (row.count > limit) {
    await refund() // don't let rejected attempts inflate the counter
    throw new QuotaExceededError(limit)
  }
  return refund
}

/** Runs one AI call under the user's quota; the request is refunded if the call fails. */
export async function withAiQuota<T>(user: QuotaUser, fn: () => Promise<T>): Promise<T> {
  const refund = await consumeAiQuota(user)
  try {
    return await fn()
  } catch (error) {
    await refund().catch(() => {})
    throw error
  }
}

export async function getTodayUsage(userId: string) {
  const [row] = await db
    .select({ count: schema.aiUsage.count })
    .from(schema.aiUsage)
    .where(and(eq(schema.aiUsage.userId, userId), eq(schema.aiUsage.day, sql`current_date`)))
  return row?.count ?? 0
}
