"use server"

import { revalidatePath } from "next/cache"
import { and, eq, isNull } from "drizzle-orm"
import { z } from "zod"
import { db, schema } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { withAiQuota } from "@/lib/ai/quota"
import { LIMITS, rateLimit } from "@/lib/rate-limit"
import { parseResumeText } from "@/lib/ai/tasks"
import { extractResumeText } from "@/lib/resume/extract"
import { emptyResume, resumeDataSchema, type ResumeDataInput } from "@/lib/resume/schema"
import { TEMPLATE_IDS, type TemplateId } from "@/lib/resume/templates"
import { run, UserError, type ActionResult } from "@/lib/actions/result"

const templateId = z.enum(TEMPLATE_IDS as [TemplateId, ...TemplateId[]])
const targetRole = z.string().trim().max(120, "Target role is too long.")

async function ownedResume(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(schema.resume)
    .where(and(eq(schema.resume.id, id), eq(schema.resume.userId, userId)))
  if (!row) throw new UserError("Resume not found.")
  return row
}

async function setPrimaryIfUnset(userId: string, resumeId: string) {
  await db
    .update(schema.user)
    .set({ primaryResumeId: resumeId })
    .where(and(eq(schema.user.id, userId), isNull(schema.user.primaryResumeId)))
}

export async function createResumeFromUpload(formData: FormData): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const user = await requireUser()
    const file = formData.get("file")
    if (!(file instanceof File)) throw new UserError("Please choose a resume file.")
    const role = targetRole.min(1, "Enter the role you are targeting.").parse(formData.get("targetRole") ?? "")
    const template = templateId.catch("minimal").parse(formData.get("template"))

    await rateLimit(`upload:${user.id}`, LIMITS.upload)
    await rateLimit(`create-resume:${user.id}`, LIMITS.createResume)
    const text = await extractResumeText(file)
    const data = await withAiQuota(user, () => parseResumeText(text, role))

    const [row] = await db
      .insert(schema.resume)
      .values({
        userId: user.id,
        title: `${data.personalInfo.name || "My"} — ${role}`.slice(0, 100),
        targetRole: role,
        template,
        data,
        sourceText: text,
      })
      .returning({ id: schema.resume.id })
    await setPrimaryIfUnset(user.id, row.id)
    revalidatePath("/dashboard")
    return { id: row.id }
  })
}

export async function createBlankResume(input: { template?: string; targetRole?: string }) {
  return run(async () => {
    const user = await requireUser()
    await rateLimit(`create-resume:${user.id}`, LIMITS.createResume)
    const role = targetRole.parse(input.targetRole ?? "")
    const data = emptyResume()
    data.personalInfo.name = user.name
    data.personalInfo.email = user.email
    data.personalInfo.role = role
    const [row] = await db
      .insert(schema.resume)
      .values({
        userId: user.id,
        title: role ? `${user.name} — ${role}` : `${user.name}'s resume`,
        targetRole: role,
        template: templateId.catch("minimal").parse(input.template),
        data,
      })
      .returning({ id: schema.resume.id })
    await setPrimaryIfUnset(user.id, row.id)
    revalidatePath("/dashboard")
    return { id: row.id }
  })
}

const updateSchema = z.object({
  title: z.string().trim().min(1, "Give the resume a title.").max(100),
  targetRole,
  template: templateId,
  data: resumeDataSchema,
})

export async function updateResume(
  id: string,
  input: { title: string; targetRole: string; template: string; data: ResumeDataInput },
) {
  return run(async () => {
    const user = await requireUser()
    await rateLimit(`mutation:${user.id}`, LIMITS.mutation)
    await ownedResume(user.id, id)
    const values = updateSchema.parse(input)
    await db.update(schema.resume).set(values).where(eq(schema.resume.id, id))
    revalidatePath(`/resume/${id}`)
    revalidatePath("/dashboard")
  })
}

export async function setResumeTemplate(id: string, template: string) {
  return run(async () => {
    const user = await requireUser()
    await rateLimit(`mutation:${user.id}`, LIMITS.mutation)
    await ownedResume(user.id, id)
    await db.update(schema.resume).set({ template: templateId.parse(template) }).where(eq(schema.resume.id, id))
    revalidatePath(`/resume/${id}`)
  })
}

export async function deleteResume(id: string) {
  return run(async () => {
    const user = await requireUser()
    await rateLimit(`mutation:${user.id}`, LIMITS.mutation)
    await ownedResume(user.id, id)
    await db.delete(schema.resume).where(eq(schema.resume.id, id))
    if (user.primaryResumeId === id) {
      const [next] = await db
        .select({ id: schema.resume.id })
        .from(schema.resume)
        .where(eq(schema.resume.userId, user.id))
        .limit(1)
      await db.update(schema.user).set({ primaryResumeId: next?.id ?? null }).where(eq(schema.user.id, user.id))
    }
    revalidatePath("/dashboard")
  })
}

export async function setPrimaryResume(id: string) {
  return run(async () => {
    const user = await requireUser()
    await rateLimit(`mutation:${user.id}`, LIMITS.mutation)
    await ownedResume(user.id, id)
    await db.update(schema.user).set({ primaryResumeId: id }).where(eq(schema.user.id, user.id))
    revalidatePath("/dashboard")
  })
}

function makeSlug() {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789"
  const bytes = crypto.getRandomValues(new Uint8Array(10))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")
}

export async function setResumeSharing(id: string, isPublic: boolean) {
  return run(async () => {
    const user = await requireUser()
    await rateLimit(`mutation:${user.id}`, LIMITS.mutation)
    const row = await ownedResume(user.id, id)
    const shareSlug = row.shareSlug ?? makeSlug()
    await db.update(schema.resume).set({ isPublic, shareSlug }).where(eq(schema.resume.id, id))
    revalidatePath(`/resume/${id}`)
    return { shareSlug: isPublic ? shareSlug : null }
  })
}
