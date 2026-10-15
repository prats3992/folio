// Calls every AI task once against OpenRouter and checks the structured output parses.
// Usage: pnpm ai:smoke
import {
  analyzeJob,
  evaluateDsaSolution,
  generateBehavioralQuestions,
  generateDsaChallenge,
  parseResumeText,
  reviewResume,
} from "@/lib/ai/tasks"
import { resumeToText } from "@/lib/resume/schema"

const SAMPLE = `Jordan Lee — jordan.lee@example.com — github.com/jordanlee
Software Engineer, Acme Corp (2022-2024): built React dashboards used by 2k users; cut API latency 40% with Redis caching.
Intern, Initech (2021): wrote Python ETL jobs.
B.Tech Computer Science, State University, 2022.
Projects: TaskFlow (Next.js, Postgres) — kanban app; WeatherBot (Python, Telegram API).
Skills: TypeScript, React, Node.js, Python, SQL, Docker, communication, teamwork.`

async function step<T>(name: string, fn: () => Promise<T>) {
  const t = Date.now()
  try {
    const out = await fn()
    console.log(`✔ ${name} (${((Date.now() - t) / 1000).toFixed(1)}s)`)
    return out
  } catch (e) {
    console.error(`✘ ${name}:`, e instanceof Error ? e.message : e)
    process.exitCode = 1
    return undefined
  }
}

const resume = await step("parse resume [structured]", () => parseResumeText(SAMPLE, "Frontend Engineer"))
if (resume) console.log("  ", resume.personalInfo.name, "|", resume.experience.length, "exp |", resume.skills.technical.slice(0, 5).join(", "))
const text = resume ? resumeToText(resume) : SAMPLE

const job = await step("job analysis [structured]", () =>
  analyzeJob({ jobTitle: "Frontend Engineer", jobDescription: "We need React, TypeScript, GraphQL and testing experience (Jest, Playwright).", resumeText: text }),
)
if (job) console.log("   match", job.overallMatch, "missing:", job.missingSkills.join(", "))

const qs = await step("behavioral [structured]", () => generateBehavioralQuestions({ jobTitle: "Frontend Engineer", resumeText: text }))
if (qs) console.log("  ", qs.length, "questions; first:", qs[0]?.question)

const dsa = await step("dsa generate [structured]", () => generateDsaChallenge("beginner"))
if (dsa) {
  console.log("  ", dsa.publicPart.title)
  const ev = await step("dsa evaluate [code]", () =>
    evaluateDsaSolution({ challenge: dsa.publicPart, referenceSolution: dsa.solution, userSolution: dsa.solution }),
  )
  if (ev) console.log("   success (reference solution):", ev.success, "score", ev.score)
}

const review = await step("resume review [chat]", () => reviewResume({ resumeText: text, targetRole: "Frontend Engineer" }))
if (review) console.log("  ", review.slice(0, 120).replace(/\n/g, " "), "…")

