import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth/auth-form"
import { getSession } from "@/lib/session"
import { safeNext } from "@/lib/safe-redirect"

export const metadata: Metadata = { title: "Log in" }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next)
  if (await getSession()) redirect(next)
  return <AuthForm mode="login" next={next} />
}
