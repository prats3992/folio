import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth/auth-form"
import { getSession } from "@/lib/session"
import { safeNext } from "@/lib/safe-redirect"

export const metadata: Metadata = { title: "Sign up" }

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; plan?: string }>
}) {
  const params = await searchParams
  const next = safeNext(params.next)
  if (await getSession()) redirect(next)
  return <AuthForm mode="signup" next={next} plan={params.plan} />
}
