"use server"

import { and, eq } from "drizzle-orm"
import { z } from "zod"
import { db, schema } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { withAiQuota } from "@/lib/ai/quota"
import { analyzeJob, generateBehavioralQuestions } from "@/lib/ai/tasks"
import { normalizeResume, resumeToText } from "@/lib/resume/schema"
import { run, UserError } from "@/lib/actions/result"

async function resumeTextFor(userId: string, resumeId: string | null | undefined) {
  if (!resumeId) return { id: null, text: "" }
  const [r] = await db
    .select()
    .from(schema.resume)
    .where(and(eq(schema.resume.id, resumeId), eq(schema.resume.userId, userId)))
  if (!r) throw new UserError("Resume not found.")
  return { id: r.id, text: resumeToText(normalizeResume(r.data)) }
}

const jobInput = z.object({
  resumeId: z.string().max(64).nullish(),
  jobTitle: z.string().trim().max(120).default(""),
  jobDescription: z
    .string()
    .trim()
    .min(50, "Paste the full job description (at least 50 characters).")
    .max(15000, "Job description is too long (max 15,000 characters)."),
})

export async function runJobAnalysis(input: z.input<typeof jobInput>) {
  return run(async () => {
    const user = await requireUser()
    const values = jobInput.parse(input)
    const resume = await resumeTextFor(user.id, values.resumeId)
    if (!resume.text) throw new UserError("Choose a resume to compare against.")
    const result = await withAiQuota(user, () => analyzeJob({ ...values, resumeText: resume.text }))
    const [row] = await db
      .insert(schema.jobAnalysis)
      .values({ userId: user.id, resumeId: resume.id, jobTitle: values.jobTitle, jobDescription: values.jobDescription, result })
      .returning()
    return row
  })
}

const behavioralInput = z.object({
  resumeId: z.string().max(64).nullish(),
  jobTitle: z.string().trim().min(2, "Enter a job title.").max(120),
})

export async function runBehavioralQuestions(input: z.input<typeof behavioralInput>) {
  return run(async () => {
    const user = await requireUser()
    const values = behavioralInput.parse(input)
    const resume = await resumeTextFor(user.id, values.resumeId)
    const questions = await withAiQuota(user, () =>
      generateBehavioralQuestions({ jobTitle: values.jobTitle, resumeText: resume.text }),
    )
    const [row] = await db
      .insert(schema.behavioralSet)
      .values({ userId: user.id, resumeId: resume.id, jobTitle: values.jobTitle, questions })
      .returning()
    return row
  })
}
