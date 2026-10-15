import type { TemplateProps } from "./types"
import { A } from "./link"
import { contactItems, href } from "./helpers"
import { sourceSerif } from "@/lib/fonts"
import { cn } from "@/lib/utils"

// Traditional single-column serif resume. Conservative, ATS-safe, prints well in black and white.

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 border-b border-neutral-800 pb-0.5 text-[0.8rem] font-semibold tracking-[0.14em] uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function ClassicTemplate({ data }: TemplateProps) {
  const { personalInfo: p, experience, education, projects, skills, certifications } = data
  const contacts = contactItems(p)

  return (
    <div className={cn(sourceSerif.className, "px-4 py-2 text-[0.92rem] leading-snug text-neutral-900")}>
      <header className="text-center">
        <h1 className="text-[2.1rem] leading-tight font-semibold tracking-tight">{p.name || "Your Name"}</h1>
        {p.role && <p className="mt-0.5 text-[1.02rem] italic text-neutral-700">{p.role}</p>}
        {contacts.length > 0 && (
          <p className="mt-2 flex flex-wrap justify-center gap-x-2 text-[0.82rem] text-neutral-700">
            {contacts.map((c, i) => (
              <span key={c.key} className="whitespace-nowrap">
                {i > 0 && <span className="mr-2 text-neutral-400">·</span>}
                {c.href ? <A href={c.href}>{c.label}</A> : c.label}
              </span>
            ))}
          </p>
        )}
      </header>

      {p.summary && (
        <Section title="Summary">
          <p className="text-justify">{p.summary}</p>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Experience">
          <div className="space-y-3">
            {experience.map((e, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-4">
                  <p>
                    <span className="font-semibold">{e.role}</span>
                    {e.company && <span>, {e.company}</span>}
                  </p>
                  <p className="shrink-0 text-[0.82rem] text-neutral-600">{e.date}</p>
                </div>
                {e.location && <p className="text-[0.82rem] italic text-neutral-600">{e.location}</p>}
                {e.achievements.length > 0 && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 marker:text-neutral-500">
                    {e.achievements.map((a, j) => (
                      <li key={j}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-2">
            {projects.map((pr, i) => (
              <div key={i}>
                <p>
                  <span className="font-semibold">{pr.name}</span>
                  {pr.technologies.length > 0 && (
                    <span className="text-[0.82rem] italic text-neutral-600"> — {pr.technologies.join(", ")}</span>
                  )}
                  {href(pr.url) && (
                    <A href={href(pr.url)} className="ml-2 text-[0.8rem] text-neutral-600 underline underline-offset-2">
                      {pr.url.replace(/^https?:\/\//, "")}
                    </A>
                  )}
                </p>
                {pr.description && <p>{pr.description}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education">
          <div className="space-y-1.5">
            {education.map((ed, i) => (
              <div key={i} className="flex items-baseline justify-between gap-4">
                <p>
                  <span className="font-semibold">{ed.degree}</span>
                  {ed.school && <span>, {ed.school}</span>}
                  {ed.location && <span className="text-neutral-600">, {ed.location}</span>}
                </p>
                <p className="shrink-0 text-[0.82rem] text-neutral-600">{ed.date}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {(skills.technical.length > 0 || skills.soft.length > 0 || certifications.length > 0) && (
        <Section title="Skills & Certifications">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
            {skills.technical.length > 0 && (
              <>
                <dt className="font-semibold">Technical</dt>
                <dd>{skills.technical.join(", ")}</dd>
              </>
            )}
            {skills.soft.length > 0 && (
              <>
                <dt className="font-semibold">Professional</dt>
                <dd>{skills.soft.join(", ")}</dd>
              </>
            )}
            {certifications.length > 0 && (
              <>
                <dt className="font-semibold">Certifications</dt>
                <dd>
                  {certifications
                    .map((c) => [c.name, c.issuer, c.date].filter(Boolean).join(", "))
                    .join("; ")}
                </dd>
              </>
            )}
          </dl>
        </Section>
      )}
    </div>
  )
}
