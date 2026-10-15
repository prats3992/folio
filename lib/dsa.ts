import type { SkillLevel } from "@/lib/ai/tasks"
import type { DsaChallengePublic } from "@/lib/ai/schemas"

type Row = {
  id: string
  skillLevel: string
  challenge: DsaChallengePublic
  solution: string
  explanation: string
  userSolution: string | null
  success: boolean | null
  score: number | null
  feedback: string | null
  timeSpentSec: number | null
  hintsUsed: number
  createdAt: Date
  submittedAt: Date | null
}

export type ClientChallenge = ReturnType<typeof toClientChallenge>

/** What the browser may see: hints only once revealed, reference solution only after submitting. */
export function toClientChallenge(row: Row) {
  const { hints, ...problem } = row.challenge
  const submitted = Boolean(row.submittedAt)
  return {
    id: row.id,
    skillLevel: row.skillLevel,
    problem,
    totalHints: hints.length,
    hints: submitted ? hints : hints.slice(0, row.hintsUsed),
    hintsUsed: row.hintsUsed,
    createdAt: row.createdAt.toISOString(),
    result: submitted
      ? {
          userSolution: row.userSolution ?? "",
          success: Boolean(row.success),
          score: row.score ?? 0,
          feedback: row.feedback ?? "",
          timeSpentSec: row.timeSpentSec ?? 0,
          solution: row.solution,
          explanation: row.explanation,
          submittedAt: row.submittedAt!.toISOString(),
        }
      : null,
  }
}

const ORDER: SkillLevel[] = ["beginner", "intermediate", "advanced", "expert"]
// seconds within which a clean solve counts as "fast" for each level
const FAST: Record<SkillLevel, number> = { beginner: 600, intermediate: 1200, advanced: 1800, expert: 2700 }

/** Promote on a clean, timely solve; demote on a failed attempt that also needed lots of help. */
export function nextSkillLevel(
  current: SkillLevel,
  r: { success: boolean; timeSpentSec: number; hintsUsed: number },
): SkillLevel {
  const i = Math.max(0, ORDER.indexOf(current))
  if (r.success && r.hintsUsed <= 1 && r.timeSpentSec <= FAST[ORDER[i]]) return ORDER[Math.min(i + 1, ORDER.length - 1)]
  if (!r.success && r.hintsUsed >= 2) return ORDER[Math.max(i - 1, 0)]
  return ORDER[i]
}
