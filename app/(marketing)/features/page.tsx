import type { Metadata } from "next"
import Link from "next/link"
import { and, desc, eq } from "drizzle-orm"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { db, schema } from "@/lib/db"

export const metadata: Metadata = { title: "How it works" }
export const revalidate = 300

const SECTIONS = [
  {
    n: "01",
    title: "Upload what you already have",
    body: "PDF, DOCX or plain text. Text is extracted on our server — the file itself never leaves it — and an open model restructures it into clean sections: experience, projects, education, skills.",
    points: ["Scanned PDFs are detected and flagged", "Nothing is invented: employers, dates and numbers come from your file", "Takes 20–60 seconds on free models"],
  },
  {
    n: "02",
    title: "Tailored to one role",
    body: "Tell us the job you're going for. Bullets are rewritten to lead with impact, the most relevant three roles and projects are kept, and your headline and summary are aimed at that role.",
    points: ["Achievement-first phrasing", "Keeps your facts, sharpens the wording", "Make several versions for different roles"],
  },
  {
    n: "03",
    title: "Edit everything, see it live",
    body: "A structured editor with a live preview of your template. Reorder experience, rewrite bullets, add certifications — then switch between ten layouts without retyping a thing.",
    points: ["Ten templates, from ATS-plain to bold", "Real multi-page PDF export via print", "Private by default; share a read-only link when you want"],
  },
  {
    n: "04",
    title: "Practise against your own resume",
    body: "The interview tools read the resume you built. A mock interviewer asks about your actual projects, job-match compares you to a real posting, and STAR questions come from your own experience.",
    points: ["Mock interviews with a scored debrief", "Job description gap analysis", "STAR prompts, adaptive DSA, recruiter-style review"],
  },
]

async function loadQuotes() {
  try {
    return await db
      .select({ quote: schema.feedback.experience, name: schema.feedback.name, role: schema.feedback.role })
      .from(schema.feedback)
      .where(and(eq(schema.feedback.isApproved, true), eq(schema.feedback.sentiment, "positive")))
      .orderBy(desc(schema.feedback.createdAt))
      .limit(2)
  } catch {
    return []
  }
}

export default async function FeaturesPage() {
  const quotes = await loadQuotes()
  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title={
          <>
            One document, <em className="text-primary">two jobs</em>.
          </>
        }
        lede="Your resume does double duty: it's what recruiters read, and it's what every practice session is built on."
      />

      <div className="mx-auto max-w-7xl px-4">
        {SECTIONS.map((s) => (
          <section key={s.n} className="grid gap-8 border-b py-14 md:grid-cols-[120px_1fr_1fr]">
            <span className="font-mono text-sm text-primary">{s.n}</span>
            <div>
              <h2 className="display text-4xl">{s.title}</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
            <ul className="space-y-3 self-end border-l pl-6 text-sm">
              {s.points.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-2 h-px w-3 shrink-0 bg-foreground/40" />
                  {p}
                </li>
              ))}
            </ul>
          </section>
        ))}

        {quotes.length > 0 && (
          <section className="grid gap-10 border-b py-14 md:grid-cols-2">
            {quotes.map((q, i) => (
              <figure key={i}>
                <blockquote className="display text-2xl leading-snug">“{q.quote}”</blockquote>
                <figcaption className="eyebrow mt-4">
                  {q.name} · {q.role}
                </figcaption>
              </figure>
            ))}
          </section>
        )}

        <section className="flex flex-wrap items-center justify-between gap-6 py-16">
          <h2 className="display text-4xl">Ready when you are.</h2>
          <div className="flex gap-3">
            <Button size="lg" asChild className="h-11 px-5">
              <Link href="/resume/new">Build my resume</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-11 px-5">
              <Link href="/pricing">See plans</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}
