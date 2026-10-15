// Seeds the public demo account and demo reviews. Safe to run repeatedly: it resets the demo
// user's data each time and leaves every other user untouched.
// Usage: pnpm db:seed
import { eq } from "drizzle-orm"
import { hashPassword } from "better-auth/crypto"
import { db, schema } from "@/lib/db"
import { DEMO_USER } from "@/lib/demo"
import { resumeDataSchema } from "@/lib/resume/schema"
import { DEMO_CHATS, DEMO_DSA, DEMO_JOB_ANALYSIS, DEMO_RESUMES, DEMO_STAR_SET } from "./fixtures/demo"
import { DEMO_FEEDBACK } from "./fixtures/feedback"

const HOUR = 60 * 60 * 1000
const ago = (hours: number) => new Date(Date.now() - hours * HOUR)

async function getOrCreateDemoUser() {
  const [existing] = await db.select().from(schema.user).where(eq(schema.user.email, DEMO_USER.email))
  if (existing) return existing
  // same rows Better Auth's email sign-up creates: a user + a "credential" account holding the scrypt hash
  const id = crypto.randomUUID()
  const [created] = await db
    .insert(schema.user)
    .values({ id, name: DEMO_USER.name, email: DEMO_USER.email, emailVerified: true })
    .returning()
  await db.insert(schema.account).values({
    id: crypto.randomUUID(),
    userId: id,
    accountId: id,
    providerId: "credential",
    password: await hashPassword(DEMO_USER.password),
  })
  return created
}

async function main() {
  const user = await getOrCreateDemoUser()
  console.log(`demo user: ${user.email} (${user.id})`)

  // reset demo-owned content (cascades remove chats → messages)
  await db.update(schema.user).set({ primaryResumeId: null, plan: "basic", dsaSkillLevel: "intermediate" }).where(eq(schema.user.id, user.id))
  for (const table of [schema.chat, schema.jobAnalysis, schema.behavioralSet, schema.dsaChallenge, schema.feedback, schema.aiUsage, schema.resume]) {
    await db.delete(table).where(eq(table.userId, user.id))
  }

  const resumeIds: string[] = []
  for (const [i, r] of DEMO_RESUMES.entries()) {
    // the public demo slug may still belong to a previous run's row; it was deleted above
    const [row] = await db
      .insert(schema.resume)
      .values({ ...r, data: resumeDataSchema.parse(r.data), userId: user.id, createdAt: ago(240 - i * 24), updatedAt: ago(48 - i * 12) })
      .returning({ id: schema.resume.id })
    resumeIds.push(row.id)
  }
  await db.update(schema.user).set({ primaryResumeId: resumeIds[0] }).where(eq(schema.user.id, user.id))
  console.log(`resumes: ${resumeIds.length} (public at /r/${DEMO_RESUMES.find((r) => r.isPublic)?.shareSlug})`)

  for (const [i, c] of DEMO_CHATS.entries()) {
    const start = ago(72 - i * 20)
    const [chat] = await db
      .insert(schema.chat)
      .values({
        userId: user.id,
        resumeId: resumeIds[c.resumeIndex],
        title: c.title,
        kind: c.kind,
        meta: { targetRole: c.targetRole },
        createdAt: start,
        updatedAt: new Date(start.getTime() + c.messages.length * 60_000),
      })
      .returning({ id: schema.chat.id })
    await db.insert(schema.message).values(
      c.messages.map((m, j) => ({
        id: crypto.randomUUID(),
        chatId: chat.id,
        role: m.role,
        parts: [{ type: "text" as const, text: m.text }],
        createdAt: new Date(start.getTime() + j * 60_000),
      })),
    )
  }
  console.log(`chats: ${DEMO_CHATS.length}`)

  await db.insert(schema.jobAnalysis).values({
    userId: user.id,
    resumeId: resumeIds[DEMO_JOB_ANALYSIS.resumeIndex],
    jobTitle: DEMO_JOB_ANALYSIS.jobTitle,
    jobDescription: DEMO_JOB_ANALYSIS.jobDescription,
    result: DEMO_JOB_ANALYSIS.result,
    createdAt: ago(30),
  })
  await db.insert(schema.behavioralSet).values({
    userId: user.id,
    resumeId: resumeIds[DEMO_STAR_SET.resumeIndex],
    jobTitle: DEMO_STAR_SET.jobTitle,
    questions: DEMO_STAR_SET.questions,
    createdAt: ago(26),
  })
  for (const [i, d] of DEMO_DSA.entries()) {
    const createdAt = ago(20 - i * 18)
    await db.insert(schema.dsaChallenge).values({
      userId: user.id,
      skillLevel: d.skillLevel,
      challenge: d.challenge,
      solution: d.solution,
      explanation: d.explanation,
      createdAt,
      ...(d.submission
        ? { ...d.submission, submittedAt: new Date(createdAt.getTime() + d.submission.timeSpentSec * 1000) }
        : {}),
    })
  }
  console.log("tools: 1 job match, 1 STAR set, 2 DSA challenges")

  await db.insert(schema.feedback).values(
    DEMO_FEEDBACK.map((f, i) => ({ ...f, userId: user.id, createdAt: ago(24 * (i + 1)) })),
  )
  console.log(`feedback: ${DEMO_FEEDBACK.length} demo reviews`)
  console.log(`\nLog in with ${DEMO_USER.email} / ${DEMO_USER.password} (or the "Explore the demo account" button).`)
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error)
    process.exit(1)
  },
)
