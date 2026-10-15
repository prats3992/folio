"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { db, schema } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { run } from "@/lib/actions/result"

/** Demo plan switch — there is no billing; plans only change the daily AI quota. */
export async function setPlan(plan: string) {
  return run(async () => {
    const user = await requireUser()
    const value = z.enum(["free", "basic", "premium"]).parse(plan)
    await db.update(schema.user).set({ plan: value }).where(eq(schema.user.id, user.id))
    revalidatePath("/dashboard")
  })
}
