import type { TemplateProps } from "./types"
import { A } from "./link"
import { contactItems, href } from "./helpers"
import { inter, sourceSerif } from "@/lib/fonts"
import { cn } from "@/lib/utils"

// Two-column layout: a quiet sidebar for facts, a wide column for the story.

const ACCENT = "#1f5f59"

function Label({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2.5 text-[0.65rem] font-semibold tracking-[0.18em] uppercase" style={{ color: ACCENT }}>{children}</h2>
}

export function EditorialTemplate({ data }: TemplateProps) {
  const { personalInfo: p, experience, education, projects, skills, certifications } = data
  const contacts = contactItems(p)

  return (
    <div className={cn(inter.className, "-m-6 grid min-h-[1056px] grid-cols-[252px_1fr] text-[0.8rem] leading-relaxed text-neutral-800 sm:-m-8 print:m-0")}>
      <aside className="space-y-7 bg-[#f4f1ea] px-7 py-10 print:bg-[#f4f1ea]">
        {contacts.length > 0 && (
          <div>
            <Label>Contact</Label>
            <ul className="space-y-1.5 text-[0.74rem] [overflow-wrap:anywhere]">
              {contacts.map((c) => (
                <li key={c.key}>{c.href ? <A href={c.href}>{c.label}</A> : c.label}</li>
              ))}
            </ul>
          </div>
        )}
        {skills.technical.length > 0 && (
          <div>
            <Label>Skills</Label>
            <ul className="space-y-1">
              {skills.technical.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        {skills.soft.length > 0 && (
          <div>
            <Label>Strengths</Label>
            <ul className="space-y-1">
              {skills.soft.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        {education.length > 0 && (
          <div>
            <Label>Education</Label>
            <div className="space-y-3">
              {education.map((ed, i) => (
                <div key={i}>
                  <p className="font-semibold text-neutral-900">{ed.degree}</p>
                  <p>{ed.school}</p>
                  <p className="text-neutral-500">{[ed.date, ed.location].filter(Boolean).join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {certifications.length > 0 && (
          <div>
            <Label>Certifications</Label>
            <div className="space-y-2">
              {certifications.map((c, i) => (
                <div key={i}>
                  <p className="font-semibold text-neutral-900">{c.name}</p>
                  <p className="text-neutral-500">{[c.issuer, c.date].filter(Boolean).join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="px-10 py-10">
        <header className="border-b border-neutral-300 pb-6">
          <h1 className={cn(sourceSerif.className, "text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-neutral-950")}>
            {p.name || "Your Name"}
          </h1>
          {p.role && (
            <p className="mt-2 text-[0.72rem] font-semibold tracking-[0.18em] uppercase" style={{ color: ACCENT }}>
              {p.role}
            </p>
          )}
          {p.summary && <p className={cn(sourceSerif.className, "mt-4 text-[0.98rem] leading-relaxed text-neutral-700")}>{p.summary}</p>}
        </header>

        {experience.length > 0 && (
          <section className="mt-7">
            <Label>Experience</Label>
            <div className="space-y-5">
              {experience.map((e, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-[0.92rem] font-semibold text-neutral-950">{e.role}</h3>
                    <span className="shrink-0 text-neutral-500 tabular-nums">{e.date}</span>
                  </div>
                  <p className="text-neutral-600">{[e.company, e.location].filter(Boolean).join(" · ")}</p>
                  {e.achievements.length > 0 && (
                    <ul className="mt-1.5 space-y-1">
                      {e.achievements.map((a, j) => (
                        <li key={j} className="relative pl-4 before:absolute before:top-[0.6em] before:left-0 before:h-px before:w-2 before:bg-neutral-400">
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section className="mt-7">
            <Label>Selected projects</Label>
            <div className="space-y-4">
              {projects.map((pr, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-[0.92rem] font-semibold text-neutral-950">{pr.name}</h3>
                    {href(pr.url) && (
                      <A href={href(pr.url)} className="shrink-0 text-neutral-500 underline-offset-2 hover:underline">
                        {pr.url.replace(/^https?:\/\//, "")}
                      </A>
                    )}
                  </div>
                  {pr.description && <p>{pr.description}</p>}
                  {pr.technologies.length > 0 && <p className="mt-0.5 text-neutral-500">{pr.technologies.join(" · ")}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
