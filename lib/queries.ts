import "server-only"
import { and, desc, eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { db, schema } from "@/lib/db"
import { normalizeResume } from "@/lib/resume/schema"

export async function getResumes(userId: string) {
  const rows = await db
    .select()
    .from(schema.resume)
    .where(eq(schema.resume.userId, userId))
    .orderBy(desc(schema.resume.updatedAt))
  return rows.map((r) => ({ ...r, data: normalizeResume(r.data) }))
}

export type ResumeRow = Awaited<ReturnType<typeof getResumes>>[number]

/** Loads a resume the user owns or 404s (never reveals that other users' ids exist). */
export async function getOwnedResumeOr404(userId: string, id: string) {
  const [r] = await db
    .select()
    .from(schema.resume)
    .where(and(eq(schema.resume.id, id), eq(schema.resume.userId, userId)))
  if (!r) notFound()
  return { ...r, data: normalizeResume(r.data) }
}

export async function getPublicResume(slug: string) {
  const [r] = await db
    .select()
    .from(schema.resume)
    .where(and(eq(schema.resume.shareSlug, slug), eq(schema.resume.isPublic, true)))
  return r ? { ...r, data: normalizeResume(r.data) } : null
}

/** Lightweight list for resume pickers in the interview tools. */
export async function getResumeOptions(userId: string) {
  return db
    .select({ id: schema.resume.id, title: schema.resume.title, targetRole: schema.resume.targetRole })
    .from(schema.resume)
    .where(eq(schema.resume.userId, userId))
    .orderBy(desc(schema.resume.updatedAt))
}
