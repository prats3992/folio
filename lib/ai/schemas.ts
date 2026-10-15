import { z } from "zod"

// Schemas for structured model output. Kept flat and descriptive so small free models follow them.

export const jobAnalysisSchema = z.object({
  overallMatch: z.number().min(0).max(100).describe("How well the resume fits the job, 0-100"),
  summary: z.string().describe("Two or three sentence verdict"),
  matchingSkills: z.array(z.string().max(200)).max(25).describe("Skills on the resume that the job asks for"),
  missingSkills: z.array(z.string().max(200)).max(25).describe("Skills the job asks for that the resume lacks"),
  matchingExperience: z.array(z.string().max(400)).max(12).describe("Resume experience relevant to the job"),
  missingExperience: z.array(z.string().max(400)).max(12).describe("Experience the job expects that the resume lacks"),
  suggestedChanges: z.array(z.string().max(500)).max(12).describe("Concrete edits to make to the resume for this job"),
})
export type JobAnalysisResult = z.infer<typeof jobAnalysisSchema>

export const behavioralCategories = [
  "leadership",
  "teamwork",
  "challenge",
  "conflict",
  "failure",
  "success",
  "communication",
  "initiative",
] as const

export const behavioralQuestionSchema = z.object({
  question: z.string(),
  category: z.enum(behavioralCategories),
  starPrompt: z.object({
    situation: z.string().describe("Guidance for describing the situation"),
    task: z.string().describe("Guidance for describing the task"),
    action: z.string().describe("Guidance for describing the actions taken"),
    result: z.string().describe("Guidance for describing the result"),
  }),
})
export const behavioralSetSchema = z.object({
  questions: z.array(behavioralQuestionSchema).min(3).max(8),
})
export type BehavioralQuestion = z.infer<typeof behavioralQuestionSchema>

export const dsaChallengeGenSchema = z.object({
  title: z.string(),
  description: z.string().describe("Full problem statement in markdown"),
  constraints: z.array(z.string()),
  sampleInput: z.string(),
  sampleOutput: z.string(),
  hints: z.array(z.string()).min(2).max(5).describe("Exactly three progressive hints that never reveal the full answer"),
  solution: z.string().describe("A correct reference solution in pseudocode or Python"),
  explanation: z.string().describe("Explanation of the approach with time and space complexity"),
})
export type DsaChallengeGen = z.infer<typeof dsaChallengeGenSchema>

export type DsaChallengePublic = Omit<DsaChallengeGen, "solution" | "explanation"> & {
  difficulty: string
  category: string
}

export const dsaEvaluationSchema = z.object({
  success: z.boolean().describe("True only if the solution is correct for all valid inputs"),
  score: z.number().min(0).max(10).describe("Integer quality score on a 1-10 scale: 1-3 wrong, 4-6 partially correct, 7-8 correct but suboptimal, 9-10 correct and optimal"),
  feedback: z.string().describe("Markdown feedback: correctness, complexity, edge cases, improvements"),
})
export type DsaEvaluation = z.infer<typeof dsaEvaluationSchema>
