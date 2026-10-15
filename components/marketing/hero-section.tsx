import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { ResumeRenderer } from "@/components/resume-templates"
import { ScaledPreview } from "@/components/resume/scaled-preview"
import { Button } from "@/components/ui/button"
import { SAMPLE_RESUME } from "@/lib/resume/sample"
import { TEMPLATES } from "@/lib/resume/templates"
import { cn } from "@/lib/utils"

const STEPS = [
  { n: "01", title: "Upload", text: "Drop in the resume you already have — PDF, DOCX or plain text." },
  { n: "02", title: "Tailor", text: "We restructure it and rewrite each bullet for the role you want." },
  { n: "03", title: "Design", text: "Pick one of ten layouts, edit anything, export a clean PDF." },
  { n: "04", title: "Practise", text: "Rehearse interviews that quote the resume you just wrote." },
]

const TOOLS = [
  { href: "/interview/new?kind=mock_interview", title: "Mock interview", text: "One question at a time, follow-ups when you're vague, a scored debrief at the end." },
  { href: "/interview/job-match", title: "Job match", text: "Paste a job post. Get a match score, the gaps, and the exact edits to make." },
  { href: "/interview/star", title: "STAR questions", text: "Behavioural questions drawn from your own experience, with a frame for each answer." },
  { href: "/interview/dsa", title: "DSA practice", text: "Problems that get harder as you improve. Hints on request, graded on the server." },
  { href: "/interview/review", title: "Resume review", text: "A recruiter's read of your resume, line-level rewrites, then follow-up in chat." },
]

function Annotation({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "eyebrow absolute hidden rounded-sm border border-primary/30 bg-background px-2.5 py-1.5 whitespace-nowrap text-primary shadow-sm sm:block",
        className,
      )}
    >
      {children}
    </div>
  )
}

export default function HeroSection() {
  const previewTemplates = TEMPLATES.filter((t) => ["classic", "editorial", "compact", "polished"].includes(t.id))

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 pt-16 pb-20 lg:grid-cols-[1.05fr_1fr] lg:pt-24 lg:pb-28">
          <div className="flex flex-col justify-center">
            <p className="eyebrow mb-6">Resume builder · Interview coach</p>
            <h1 className="display text-[3.4rem] sm:text-7xl lg:text-[5.4rem]">
              Write the story.
              <br />
              <em className="text-primary">Rehearse</em> the interview.
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Turn the resume you have into one written for the job you want — then practise the interview it gets you,
              with questions that come straight from <span className="mark-highlight text-foreground">your own experience</span>.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Button size="lg" asChild className="h-11 px-5 text-[0.95rem]">
                <Link href="/resume/new">
                  Build my resume <ArrowRight />
                </Link>
              </Button>
              <Link href="/login" className="text-sm underline decoration-border underline-offset-4 hover:decoration-foreground">
                or look around the demo account
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[480px]">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rotate-[2.5deg] rounded-sm border bg-card" />
            <div className="relative -rotate-1 overflow-hidden rounded-sm border bg-white shadow-[0_30px_60px_-30px_rgb(40_30_10/0.35)]">
              <ScaledPreview ratio={1.3} className="rounded-none border-0">
                <ResumeRenderer template="editorial" data={SAMPLE_RESUME} />
              </ScaledPreview>
            </div>
            <Annotation className="top-[18%] -left-8 -rotate-2">Rewritten for target role</Annotation>
            <Annotation className="top-[40%] -right-6 rotate-1">Impact, quantified</Annotation>
            <Annotation className="top-[72%] -left-6 -rotate-1">ATS-safe structure</Annotation>
          </div>
        </div>
      </section>

      {/* Before / after */}
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[0.8fr_1fr_1fr] md:gap-12">
          <div>
            <p className="eyebrow mb-3">What tailoring means</p>
            <h2 className="display text-4xl">Same job. Better sentence.</h2>
          </div>
          <div className="border-l pl-6">
            <p className="eyebrow mb-3">Before</p>
            <p className="text-lg text-muted-foreground line-through decoration-muted-foreground/40">
              Responsible for working on the dashboard and helping with performance issues.
            </p>
          </div>
          <div className="border-l border-primary pl-6">
            <p className="eyebrow mb-3 text-primary">After · for “Senior Frontend Engineer”</p>
            <p className="text-lg">
              Rebuilt the analytics dashboard in React and TypeScript for 2,000 daily users, cutting{" "}
              <span className="mark-highlight">load time by 40%</span> through code-splitting and caching.
            </p>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <h2 className="display max-w-xl text-5xl">From an old PDF to offer-ready, in four steps.</h2>
            <p className="eyebrow">About five minutes, end to end</p>
          </div>
          <ol className="grid border-t sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.n} className={cn("py-8 pr-8", i % 2 === 1 && "sm:border-l sm:pl-8", i > 0 && "lg:border-l lg:pl-8")}>
                <span className="font-mono text-sm text-primary">{s.n}</span>
                <h3 className="display mt-3 text-3xl">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Interview */}
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4">Interview prep</p>
            <h2 className="display text-5xl">Practice that has read your resume.</h2>
            <p className="mt-5 max-w-md text-muted-foreground">
              Every tool works from the resume you built, so the questions sound like the ones a real interviewer will
              ask you.
            </p>
            <ul className="mt-10 divide-y border-y">
              {TOOLS.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-4">
                    <span className="text-lg font-medium">{t.title}</span>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                    <span className="col-span-2 text-sm text-muted-foreground">{t.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <figure className="self-center rounded-sm border bg-background p-6 sm:p-8">
            <figcaption className="eyebrow mb-6 flex justify-between">
              <span>Mock interview · Senior Frontend Engineer</span>
              <span>Q2 of 8</span>
            </figcaption>
            <div className="space-y-6 text-[0.95rem] leading-relaxed">
              <div>
                <p className="eyebrow mb-1 text-primary">Interviewer</p>
                <p className="display text-2xl leading-snug">
                  “You cut p95 latency from 900 to 220 ms at Brightpath. How did you find the bottleneck — and what did
                  you fix first?”
                </p>
              </div>
              <div className="border-l-2 pl-4">
                <p className="eyebrow mb-1">You</p>
                <p className="text-muted-foreground">
                  We traced it in Datadog: booking search ran an N+1 query per clinic. I rewrote it as one join, then
                  cached availability in Redis with a 60-second TTL…
                </p>
              </div>
              <div className="rounded-sm bg-accent/60 p-4 text-sm">
                <p className="eyebrow mb-1 text-accent-foreground">Feedback</p>
                Root cause before caching — good. Next time, say how you invalidated the cache when a slot was booked.
              </div>
            </div>
          </figure>
        </div>
      </section>

      {/* Templates */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="display text-5xl">Ten layouts. One click apart.</h2>
            <Link href="/templates" className="text-sm underline decoration-border underline-offset-4 hover:decoration-foreground">
              Browse all templates →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {previewTemplates.map((t) => (
              <Link key={t.id} href={`/resume/new?template=${t.id}`} className="group">
                <ScaledPreview ratio={1.3} className="rounded-sm transition-transform group-hover:-translate-y-1">
                  <ResumeRenderer template={t.id} data={SAMPLE_RESUME} />
                </ScaledPreview>
                <p className="mt-3 flex justify-between text-sm">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground">{t.tags[0]}</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section>
        <div className="mx-auto max-w-4xl px-4 py-24 text-center">
          <h2 className="display text-5xl sm:text-6xl">
            Your next interview starts
            <br />
            with a <em className="text-primary">better page</em>.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild className="h-11 px-5">
              <Link href="/signup">Create a free account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-11 px-5">
              <Link href="/templates">See the templates</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
