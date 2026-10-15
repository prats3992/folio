import "server-only"
import { sql } from "drizzle-orm"
import { db, schema } from "@/lib/db"

export class RateLimitError extends Error {
  constructor(message = "You're doing that too often. Please wait a moment and try again.") {
    super(message)
    this.name = "RateLimitError"
  }
}

export type Limit = { max: number; windowSec: number; message?: string }

// Central place for every app-level limit. Auth endpoints are limited separately by Better Auth.
export const LIMITS = {
  /** burst control on top of the daily AI quota */
  aiBurst: { max: 6, windowSec: 60, message: "Too many AI requests at once — give it a minute." },
  /** protects the shared OpenRouter key from multi-account abuse */
  aiGlobalDaily: { max: Number(process.env.AI_GLOBAL_DAILY_LIMIT ?? 2000), windowSec: 86_400, message: "The AI service has hit today's overall limit. Please try again tomorrow." },
  upload: { max: 10, windowSec: 3600, message: "Upload limit reached (10 per hour)." },
  createResume: { max: 20, windowSec: 3600, message: "You've created a lot of resumes this hour — try again later." },
  createChat: { max: 40, windowSec: 3600, message: "You've started a lot of conversations this hour — try again later." },
  mutation: { max: 90, windowSec: 60 },
} satisfies Record<string, Limit>

/**
 * Atomic fixed-window counter in Postgres (works across serverless instances).
 * Throws RateLimitError when the window's count exceeds `max`.
 */
export async function rateLimit(key: string, limit: Limit) {
  const t = schema.appRateLimit
  const expired = sql`${t.windowStart} < now() - make_interval(secs => ${limit.windowSec})`
  const [row] = await db
    .insert(t)
    .values({ key, count: 1 })
    .onConflictDoUpdate({
      target: t.key,
      set: {
        count: sql`case when ${expired} then 1 else ${t.count} + 1 end`,
        windowStart: sql`case when ${expired} then now() else ${t.windowStart} end`,
      },
    })
    .returning({ count: t.count })
  if (row.count > limit.max) throw new RateLimitError(limit.message)
}
