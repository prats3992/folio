"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { setPlan } from "@/lib/actions/account"
import { signIn, signUp } from "@/lib/auth-client"
import { DEMO_USER } from "@/lib/demo"

export function AuthForm({ mode, next, plan }: { mode: "login" | "signup"; next: string; plan?: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function finish() {
    router.push(next)
    router.refresh()
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")
    setError(null)
    startTransition(async () => {
      const { error } =
        mode === "login"
          ? await signIn.email({ email, password })
          : await signUp.email({ email, password, name: String(form.get("name") ?? "").trim() })
      if (error) {
        setError(error.message ?? "Something went wrong. Please try again.")
        return
      }
      if (mode === "signup" && plan && plan !== "free") await setPlan(plan)
      finish()
    })
  }

  function demoLogin() {
    setError(null)
    startTransition(async () => {
      const { error } = await signIn.email({ email: DEMO_USER.email, password: DEMO_USER.password })
      if (error) {
        toast.error("The demo account isn't set up yet — run `pnpm db:seed`.")
        return
      }
      finish()
    })
  }

  const isLogin = mode === "login"
  const otherHref = `${isLogin ? "/signup" : "/login"}${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`

  return (
    <div>
      <p className="eyebrow mb-3">{isLogin ? "Log in" : "Sign up"}</p>
      <h1 className="display text-5xl">{isLogin ? "Welcome back." : "Start writing."}</h1>
      <p className="mt-3 mb-8 text-sm text-muted-foreground">
        {isLogin ? "Pick up your resumes and interview prep where you left off." : "Free, no credit card. Takes ten seconds."}
      </p>
      <div>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            {!isLogin && (
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" name="name" autoComplete="name" required maxLength={80} />
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={8}
                required
              />
            </Field>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={pending} size="lg" className="h-10">
              {pending && <Spinner />} {isLogin ? "Log in" : "Create account"}
            </Button>
            <FieldSeparator>or</FieldSeparator>
            <Button type="button" variant="outline" size="lg" className="h-10" disabled={pending} onClick={demoLogin}>
              Explore the demo account
            </Button>
          </FieldGroup>
        </form>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        {isLogin ? "New here?" : "Already have an account?"}&nbsp;
        <Link href={otherHref} className="text-primary underline-offset-4 hover:underline">
          {isLogin ? "Create an account" : "Log in"}
        </Link>
      </p>
    </div>
  )
}
