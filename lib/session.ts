import "server-only"
import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db, schema } from "@/lib/db"

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

/** Fresh user row (plan / skill level change without re-login, so don't trust the cookie cache). */
export const requireUser = cache(async () => {
  const session = await getSession()
  if (!session) redirect("/login")
  const [row] = await db.select().from(schema.user).where(eq(schema.user.id, session.user.id))
  if (!row) redirect("/login")
  return row
})

export type AppUser = Awaited<ReturnType<typeof requireUser>>

/** For route handlers / actions that must not redirect. */
export async function getUserOrNull() {
  const session = await getSession()
  return session?.user ?? null
}
