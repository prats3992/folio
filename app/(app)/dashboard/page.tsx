import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Plus } from "lucide-react"
import { PlanSwitcher } from "@/components/dashboard/plan-switcher"
import { ResumeCardActions } from "@/components/dashboard/resume-card-actions"
import { ResumeRenderer } from "@/components/resume-templates"
import { ScaledPreview } from "@/components/resume/scaled-preview"
import { Button } from "@/components/ui/button"
import { getTodayUsage } from "@/lib/ai/quota"
import { listChats } from "@/lib/chat/store"
import { getPlan } from "@/lib/plans"
import { getResumes } from "@/lib/queries"
import { getTemplateMeta } from "@/lib/resume/templates"
import { requireUser } from "@/lib/session"

export const metadata: Metadata = { title: "Dashboard" }

const TOOLS = [
  { href: "/interview/new?kind=mock_interview", title: "Mock interview", text: "One question at a time, scored debrief" },
  { href: "/interview/job-match", title: "Job match", text: "Compare your resume with a job post" },
  { href: "/interview/star", title: "STAR questions", text: "Behavioural questions for your role" },
  { href: "/interview/dsa", title: "DSA practice", text: "Adaptive coding challenges" },
  { href: "/interview/review", title: "Resume review", text: "A recruiter's critique, then follow up in chat" },
]

const KIND_LABEL: Record<string, string> = {
  general: "Coaching",
  mock_interview: "Mock interview",
  resume_review: "Review",
}

const dateFmt = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" })
const longDate = new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long" })

export default async function DashboardPage() {
  const user = await requireUser()
  const [resumes, usage, chats] = await Promise.all([getResumes(user.id), getTodayUsage(user.id), listChats(user.id)])
  const plan = getPlan(user.plan)
  const pct = Math.min(100, (usage / plan.dailyAiLimit) * 100)

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-20">
      <header className="flex flex-wrap items-end justify-between gap-8 border-b pt-12 pb-10">
        <div>
          <p className="eyebrow mb-3">{longDate.format(new Date())}</p>
          <h1 className="display text-5xl sm:text-6xl">Hello, {user.name.split(" ")[0]}.</h1>
        </div>
        <div className="w-full max-w-xs space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="eyebrow">AI requests today</span>
            <span className="font-mono text-sm">
              {usage}/{plan.dailyAiLimit}
            </span>
          </div>
          <div className="h-px w-full bg-border">
            <div className="h-px bg-foreground" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Plan (demo, no billing)</span>
            <PlanSwitcher plan={plan.id} />
          </div>
        </div>
      </header>

      <section className="border-b py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">01 — Resumes</p>
            <h2 className="display text-4xl">Your documents</h2>
          </div>
          <Button asChild>
            <Link href="/resume/new">
              <Plus /> New resume
            </Link>
          </Button>
        </div>

        {resumes.length === 0 ? (
          <div className="grid place-items-center rounded-sm border border-dashed py-16 text-center">
            <p className="display text-3xl">Nothing here yet.</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Upload your current resume and we&apos;ll restructure it for the role you want — or start from a blank page.
            </p>
            <Button asChild className="mt-6">
              <Link href="/resume/new">Create your first resume</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((r) => {
              const isPrimary = r.id === user.primaryResumeId
              return (
                <article key={r.id}>
                  <div className="relative">
                    <ScaledPreview
                      ratio={0.78}
                      className="rounded-sm shadow-[0_20px_40px_-28px_rgb(40_30_10/0.45)] transition-transform hover:-translate-y-1"
                    >
                      <ResumeRenderer template={r.template} data={r.data} />
                    </ScaledPreview>
                    {/* overlay link: the template itself contains links, and <a> can't nest */}
                    <Link href={`/resume/${r.id}`} className="absolute inset-0 rounded-sm" aria-label={`Open ${r.title}`} />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3 border-t pt-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-medium">{r.title}</h3>
                      <p className="truncate text-sm text-muted-foreground">
                        {r.targetRole || "No target role"} · {getTemplateMeta(r.template).name}
                      </p>
                      <p className="eyebrow mt-2 flex flex-wrap gap-x-3">
                        <span>Edited {dateFmt.format(r.updatedAt)}</span>
                        {isPrimary && <span className="text-primary">Used for practice</span>}
                        {r.isPublic && <span>Public link</span>}
                      </p>
                    </div>
                    <ResumeCardActions id={r.id} title={r.title} isPrimary={isPrimary} />
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="grid gap-12 py-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-2">02 — Practise</p>
          <h2 className="display mb-6 text-4xl">Interview prep</h2>
          <ul className="divide-y border-y">
            {TOOLS.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="group flex items-baseline justify-between gap-4 py-3.5">
                  <span>
                    <span className="font-medium">{t.title}</span>
                    <span className="ml-3 text-sm text-muted-foreground">{t.text}</span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-2">03 — Recent</p>
          <h2 className="display mb-6 text-4xl">Conversations</h2>
          {chats.length === 0 ? (
            <p className="border-y py-6 text-sm text-muted-foreground">
              No conversations yet.{" "}
              <Link href="/interview/new" className="text-foreground underline underline-offset-4">
                Start one
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y border-y">
              {chats.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link href={`/interview/${c.id}`} className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-3.5 hover:text-primary">
                    <span className="truncate">{c.title}</span>
                    <span className="eyebrow">
                      {KIND_LABEL[c.kind] ?? c.kind} · {dateFmt.format(c.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}
