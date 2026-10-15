import "server-only"
import { unstable_rethrow } from "next/navigation"
import { z } from "zod"
import { APICallError, NoObjectGeneratedError, RetryError } from "ai"
import { QuotaExceededError } from "@/lib/ai/quota"
import { ExtractError } from "@/lib/resume/extract"
import { RateLimitError } from "@/lib/rate-limit"

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string }

export class UserError extends Error {}

/** Runs a server action body and maps failures to safe, user-facing messages. */
export async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() }
  } catch (error) {
    unstable_rethrow(error) // let redirect()/notFound() through
    if (error instanceof UserError ||
      error instanceof QuotaExceededError ||
      error instanceof RateLimitError ||
      error instanceof ExtractError) {
      return { ok: false, error: error.message }
    }
    if (error instanceof z.ZodError) {
      return { ok: false, error: error.issues[0]?.message ?? "Invalid input." }
    }
    console.error("[action]", error)
    if (NoObjectGeneratedError.isInstance(error)) {
      return { ok: false, error: "The AI returned an unexpected response. Please try again." }
    }
    if (APICallError.isInstance(error) || RetryError.isInstance(error)) {
      return {
        ok: false,
        error: "The free AI models are busy right now. Please try again in a minute.",
      }
    }
    return { ok: false, error: "Something went wrong. Please try again." }
  }
}
