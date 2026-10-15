import { z } from "zod"

export const FEEDBACK_FEATURES = [
  "Resume Builder",
  "Templates",
  "Mock Interview",
  "Interview Chat",
  "Job Match",
  "STAR Questions",
  "DSA Practice",
  "Other",
] as const

export const feedbackSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters.").max(100),
  experience: z.string().trim().min(20, "Please provide more details about your experience.").max(2000),
  feature: z.enum(FEEDBACK_FEATURES, "Please select a feature."),
  sentiment: z.enum(["positive", "negative", "neutral"]),
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  role: z.string().trim().min(2, "Role must be at least 2 characters.").max(80),
  company: z.string().trim().min(2, "Company must be at least 2 characters.").max(80),
})

export type FeedbackInput = z.infer<typeof feedbackSchema>
