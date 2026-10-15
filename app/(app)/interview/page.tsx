import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export const metadata: Metadata = { title: "Interview prep" }

const TOOLS = [
  { href: "/interview/new?kind=mock_interview", title: "Mock interview", text: "A realistic interviewer for your target role. One question at a time, follow-ups when you're vague, a scored debrief at the end." },
  { href: "/interview/new", title: "Coaching chat", text: "Strategy, salary, “tell me about yourself” — the coach has read your resume." },
  { href: "/interview/review", title: "Resume review", text: "A recruiter-style critique with line-level rewrites and ATS tips. Continue in chat afterwards." },
  { href: "/interview/job-match", title: "Job match", text: "Paste a job description to see your match score, the gaps, and what to change." },
  { href: "/interview/star", title: "STAR questions", text: "Behavioural questions drawn from your background, with guidance for each STAR step." },
  { href: "/interview/dsa", title: "DSA practice", text: "Coding problems that adapt to your level. Hints on demand, graded on the server." },
]

export default function InterviewHome() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="eyebrow mb-3">Interview prep</p>
      <h1 className="display text-5xl">What are we practising today?</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Every tool uses your primary resume, so practice sounds like the real thing.
      </p>
      <ol className="mt-10 divide-y border-y">
        {TOOLS.map((t, i) => (
          <li key={t.href}>
            <Link href={t.href} className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-1 py-5">
              <span className="font-mono text-sm text-primary">{String(i + 1).padStart(2, "0")}</span>
              <span className="display text-3xl">{t.title}</span>
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
              <span className="col-start-2 col-end-4 text-sm text-muted-foreground">{t.text}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
