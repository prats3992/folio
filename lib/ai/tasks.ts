import "server-only"
import { generateText, NoObjectGeneratedError, Output } from "ai"
import { model } from "@/lib/ai/models"
import { SYSTEM, fence } from "@/lib/ai/prompts"
import {
  behavioralSetSchema,
  dsaChallengeGenSchema,
  dsaEvaluationSchema,
  jobAnalysisSchema,
  type DsaChallengePublic,
} from "@/lib/ai/schemas"
import { resumeDataSchema, resumeExtractionSchema, type ResumeData } from "@/lib/resume/schema"

// Pure AI calls (no DB, no auth). Callers are responsible for auth + quota.

const MAX_RETRIES = 2

/** Free models occasionally return JSON that misses the schema; one more attempt usually fixes it. */
async function retryOnSchemaMismatch<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (!NoObjectGeneratedError.isInstance(error)) throw error
    return fn()
  }
}

export async function parseResumeText(text: string, targetRole: string): Promise<ResumeData> {
  const { output } = await retryOnSchemaMismatch(() => generateText({
    model: model("structured"),
    system: SYSTEM.resumeParse,
    prompt: `Target role: ${targetRole || "not specified"}\n\n${fence("resume", text)}`,
    output: Output.object({ schema: resumeExtractionSchema }),
    temperature: 0.2,
    maxOutputTokens: 6000,
    maxRetries: MAX_RETRIES,
  }))
  return resumeDataSchema.parse(output)
}

export async function analyzeJob(input: {
  jobTitle: string
  jobDescription: string
  resumeText: string
}) {
  const { output } = await retryOnSchemaMismatch(() => generateText({
    model: model("structured"),
    system: SYSTEM.jobAnalysis,
    prompt: [
      input.jobTitle ? `Job title: ${input.jobTitle}` : "",
      fence("job_description", input.jobDescription),
      fence("resume", input.resumeText || "(no resume provided)"),
    ].join("\n\n"),
    output: Output.object({ schema: jobAnalysisSchema }),
    temperature: 0.3,
    maxOutputTokens: 3000,
    maxRetries: MAX_RETRIES,
  }))
  return { ...output, overallMatch: Math.round(output.overallMatch) }
}

export async function generateBehavioralQuestions(input: { jobTitle: string; resumeText: string }) {
  const { output } = await retryOnSchemaMismatch(() => generateText({
    model: model("structured"),
    system: SYSTEM.behavioral,
    prompt: `Generate 5 behavioural interview questions for a ${input.jobTitle} position, each in a different category.\n\n${fence(
      "resume",
      input.resumeText || "(no resume provided)",
    )}`,
    output: Output.object({ schema: behavioralSetSchema }),
    temperature: 0.8,
    maxOutputTokens: 3000,
    maxRetries: MAX_RETRIES,
  }))
  return output.questions
}

export const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const
export type SkillLevel = (typeof SKILL_LEVELS)[number]

const LEVEL_SPEC: Record<SkillLevel, { difficulty: string; categories: string[] }> = {
  beginner: { difficulty: "Easy", categories: ["Arrays", "Strings", "Basic Math", "Simple Recursion"] },
  intermediate: {
    difficulty: "Medium",
    categories: ["Hash Tables", "Two Pointers", "Binary Search", "Linked Lists", "Stacks", "Queues"],
  },
  advanced: {
    difficulty: "Medium to Hard",
    categories: ["Trees", "Graphs", "Dynamic Programming", "Greedy Algorithms", "Backtracking"],
  },
  expert: {
    difficulty: "Hard",
    categories: ["Advanced Dynamic Programming", "Complex Graph Algorithms", "Segment Trees & Fenwick Trees", "Tries & String Algorithms"],
  },
}

export async function generateDsaChallenge(level: SkillLevel) {
  const spec = LEVEL_SPEC[level]
  const category = spec.categories[Math.floor(Math.random() * spec.categories.length)]
  const { output } = await retryOnSchemaMismatch(() => generateText({
    model: model("structured"),
    system: SYSTEM.dsaGenerate,
    prompt: `Create an original ${spec.difficulty} coding problem in the category "${category}" for a ${level} programmer. Avoid the most famous textbook problems.`,
    output: Output.object({ schema: dsaChallengeGenSchema }),
    temperature: 0.9,
    maxOutputTokens: 6000,
    maxRetries: MAX_RETRIES,
  }))
  const { solution, explanation, ...rest } = output
  const publicPart: DsaChallengePublic = { ...rest, hints: rest.hints.slice(0, 3), difficulty: spec.difficulty, category }
  return { publicPart, solution, explanation }
}

export async function evaluateDsaSolution(input: {
  challenge: DsaChallengePublic
  referenceSolution: string
  userSolution: string
}) {
  const c = input.challenge
  const { output } = await retryOnSchemaMismatch(() => generateText({
    model: model("code"),
    system: SYSTEM.dsaEvaluate,
    prompt: [
      `Problem: ${c.title}\n${c.description}`,
      `Constraints:\n${c.constraints.map((x) => `- ${x}`).join("\n")}`,
      `Sample input: ${c.sampleInput}\nSample output: ${c.sampleOutput}`,
      `Reference solution (for your eyes only):\n${input.referenceSolution}`,
      fence("candidate_solution", input.userSolution),
    ].join("\n\n"),
    output: Output.object({ schema: dsaEvaluationSchema }),
    temperature: 0.1,
    maxOutputTokens: 2000,
    maxRetries: MAX_RETRIES,
  }))
  // some models answer on a 0-1 scale despite the instructions
  let score = output.score <= 1 ? output.score * 10 : output.score
  if (output.success) score = Math.max(score, 7)
  return { ...output, score: Math.round(Math.min(10, score)) }
}

export async function reviewResume(input: { resumeText: string; targetRole: string }) {
  const { text } = await generateText({
    model: model("chat"),
    system: SYSTEM.resumeReview,
    prompt: `Target role: ${input.targetRole || "not specified"}\n\n${fence("resume", input.resumeText)}`,
    temperature: 0.4,
    maxOutputTokens: 4000,
    maxRetries: MAX_RETRIES,
  })
  return text
}

/** Chat titles come from the first message — no model call, no quota spent. */
export function titleFromMessage(firstMessage: string) {
  const clean = firstMessage.replace(/\s+/g, " ").trim()
  return clean.length > 48 ? `${clean.slice(0, 47).trimEnd()}…` : clean || "New chat"
}
