"use server"

import { revalidatePath } from "next/cache"
import { and, desc, eq, isNull, sql } from "drizzle-orm"
import { z } from "zod"
import { db, schema } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { withAiQuota } from "@/lib/ai/quota"
import { LIMITS, rateLimit } from "@/lib/rate-limit"
import { evaluateDsaSolution, generateDsaChallenge, SKILL_LEVELS, type SkillLevel } from "@/lib/ai/tasks"
import { nextSkillLevel, toClientChallenge } from "@/lib/dsa"
import { run, UserError } from "@/lib/actions/result"

async function ownedChallenge(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(schema.dsaChallenge)
    .where(and(eq(schema.dsaChallenge.id, id), eq(schema.dsaChallenge.userId, userId)))
  if (!row) throw new UserError("Challenge not found.")
  return row
}

export async function newChallenge() {
  return run(async () => {
    const user = await requireUser()
    const level = (SKILL_LEVELS as readonly string[]).includes(user.dsaSkillLevel)
      ? (user.dsaSkillLevel as SkillLevel)
      : "beginner"
    const { publicPart, solution, explanation } = await withAiQuota(user, () => generateDsaChallenge(level))
    const [row] = await db
      .insert(schema.dsaChallenge)
      .values({ userId: user.id, skillLevel: level, challenge: publicPart, solution, explanation })
      .returning()
    revalidatePath("/interview/dsa")
    return toClientChallenge(row)
  })
}

export async function revealHint(challengeId: string) {
  return run(async () => {
    const user = await requireUser()
    await rateLimit(`mutation:${user.id}`, LIMITS.mutation)
    const row = await ownedChallenge(user.id, challengeId)
    if (row.submittedAt) return toClientChallenge(row)
    if (row.hintsUsed >= row.challenge.hints.length) throw new UserError("No more hints for this problem.")
    const [updated] = await db
      .update(schema.dsaChallenge)
      .set({ hintsUsed: sql`${schema.dsaChallenge.hintsUsed} + 1` })
      .where(and(eq(schema.dsaChallenge.id, row.id), isNull(schema.dsaChallenge.submittedAt)))
      .returning()
    return toClientChallenge(updated ?? row)
  })
}

const solutionInput = z
  .string()
  .trim()
  .min(20, "Write a little more — at least a sketch of your approach.")
  .max(10000, "Solutions are limited to 10,000 characters.")

export async function submitSolution(challengeId: string, solution: string) {
  return run(async () => {
    const user = await requireUser()
    const row = await ownedChallenge(user.id, challengeId)
    if (row.submittedAt) throw new UserError("This challenge has already been submitted.")
    const userSolution = solutionInput.parse(solution)
    const evaluation = await withAiQuota(user, () =>
      evaluateDsaSolution({ challenge: row.challenge, referenceSolution: row.solution, userSolution }),
    )
    const submittedAt = new Date()
    const timeSpentSec = Math.round((submittedAt.getTime() - row.createdAt.getTime()) / 1000)
    const [updated] = await db
      .update(schema.dsaChallenge)
      .set({
        userSolution,
        success: evaluation.success,
        score: Math.round(evaluation.score),
        feedback: evaluation.feedback,
        timeSpentSec,
        submittedAt,
      })
      .where(and(eq(schema.dsaChallenge.id, row.id), isNull(schema.dsaChallenge.submittedAt)))
      .returning()
    if (!updated) throw new UserError("This challenge has already been submitted.")

    const newLevel = nextSkillLevel(user.dsaSkillLevel as SkillLevel, {
      success: evaluation.success,
      timeSpentSec,
      hintsUsed: updated.hintsUsed,
    })
    if (newLevel !== user.dsaSkillLevel) {
      await db.update(schema.user).set({ dsaSkillLevel: newLevel }).where(eq(schema.user.id, user.id))
    }
    revalidatePath("/interview/dsa")
    return { challenge: toClientChallenge(updated), previousLevel: user.dsaSkillLevel, newLevel }
  })
}

export async function getDsaState() {
  const user = await requireUser()
  const rows = await db
    .select()
    .from(schema.dsaChallenge)
    .where(eq(schema.dsaChallenge.userId, user.id))
    .orderBy(desc(schema.dsaChallenge.createdAt))
    .limit(20)
  return { skillLevel: user.dsaSkillLevel, challenges: rows.map(toClientChallenge) }
}
