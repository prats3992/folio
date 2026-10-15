import { z } from "zod"

// Canonical resume shape shared by the builder, the templates and the interview tools.
// Every collection defaults to [] so templates never have to guard against missing arrays.

const str = (max = 300) => z.string().trim().max(max).default("")

export const personalInfoSchema = z.object({
  name: str(120),
  role: str(120),
  email: str(200),
  phone: str(50),
  location: str(120),
  github: str(300),
  linkedin: str(300),
  website: str(300),
  photo: str(1000),
  summary: str(1500),
})

export const educationSchema = z.object({
  degree: str(200),
  school: str(200),
  location: str(120),
  date: str(80),
})

export const experienceSchema = z.object({
  role: str(150),
  company: str(150),
  location: str(120),
  date: str(80),
  achievements: z.array(z.string().trim().max(500)).max(12).default([]),
})

export const projectSchema = z.object({
  name: str(150),
  description: str(800),
  technologies: z.array(z.string().trim().max(60)).max(20).default([]),
  url: str(300),
})

export const certificationSchema = z.object({
  name: str(200),
  issuer: str(150),
  date: str(80),
})

export const resumeDataSchema = z.object({
  personalInfo: personalInfoSchema.default(personalInfoSchema.parse({})),
  education: z.array(educationSchema).max(10).default([]),
  experience: z.array(experienceSchema).max(15).default([]),
  projects: z.array(projectSchema).max(15).default([]),
  skills: z
    .object({
      technical: z.array(z.string().trim().max(60)).max(60).default([]),
      soft: z.array(z.string().trim().max(60)).max(30).default([]),
    })
    .default({ technical: [], soft: [] }),
  certifications: z.array(certificationSchema).max(15).default([]),
})

// Same shape with every field required and no defaults — sent to the model as the output schema.
// (Optional fields make small models return sparse objects.)
export const resumeExtractionSchema = z.object({
  personalInfo: z.object({
    name: z.string().describe("Full name"),
    role: z.string().describe("Professional title, tailored to the target role"),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    github: z.string().describe("GitHub URL or empty string"),
    linkedin: z.string().describe("LinkedIn URL or empty string"),
    website: z.string().describe("Personal website or empty string"),
    summary: z.string().describe("2-3 sentence professional summary for the target role"),
  }),
  education: z.array(z.object({ degree: z.string(), school: z.string(), location: z.string(), date: z.string() })),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      location: z.string(),
      date: z.string(),
      achievements: z.array(z.string()).describe("2-5 achievement bullets"),
    }),
  ),
  projects: z.array(
    z.object({ name: z.string(), description: z.string(), technologies: z.array(z.string()), url: z.string() }),
  ),
  skills: z.object({ technical: z.array(z.string()), soft: z.array(z.string()) }),
  certifications: z.array(z.object({ name: z.string(), issuer: z.string(), date: z.string() })),
})

export type ResumeData = z.infer<typeof resumeDataSchema>
export type ResumeDataInput = z.input<typeof resumeDataSchema>
export type Education = ResumeData["education"][number]
export type Experience = ResumeData["experience"][number]
export type Project = ResumeData["projects"][number]

export const emptyResume = (): ResumeData => resumeDataSchema.parse({})

/** Normalises anything resume-shaped (DB rows, AI output, old Firebase exports) into ResumeData. */
export function normalizeResume(input: unknown): ResumeData {
  const parsed = resumeDataSchema.safeParse(input ?? {})
  return parsed.success ? parsed.data : emptyResume()
}

/** Compact plain-text rendering of a resume, used as AI context. */
export function resumeToText(r: ResumeData): string {
  const lines: string[] = []
  const p = r.personalInfo
  lines.push(`${p.name}${p.role ? ` — ${p.role}` : ""}`)
  if (p.summary) lines.push(`Summary: ${p.summary}`)
  if (r.skills.technical.length) lines.push(`Technical skills: ${r.skills.technical.join(", ")}`)
  if (r.skills.soft.length) lines.push(`Soft skills: ${r.skills.soft.join(", ")}`)
  if (r.experience.length) {
    lines.push("Experience:")
    for (const e of r.experience) {
      lines.push(`- ${e.role} at ${e.company} (${e.date}${e.location ? `, ${e.location}` : ""})`)
      for (const a of e.achievements) lines.push(`  • ${a}`)
    }
  }
  if (r.projects.length) {
    lines.push("Projects:")
    for (const pr of r.projects) {
      lines.push(`- ${pr.name}: ${pr.description}${pr.technologies.length ? ` [${pr.technologies.join(", ")}]` : ""}`)
    }
  }
  if (r.education.length) {
    lines.push("Education:")
    for (const ed of r.education) lines.push(`- ${ed.degree}, ${ed.school} (${ed.date})`)
  }
  if (r.certifications.length) {
    lines.push("Certifications:")
    for (const c of r.certifications) lines.push(`- ${c.name}${c.issuer ? `, ${c.issuer}` : ""}`)
  }
  return lines.join("\n")
}
