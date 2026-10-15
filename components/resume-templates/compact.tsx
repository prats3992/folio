import type { TemplateProps } from "./types"
import { A } from "./link"
import { contactItems, href } from "./helpers"
import { plexMono, plexSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"

// Dense, grid-based layout with section labels in a left gutter. Fits a lot on one page.

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-[112px_1fr] gap-x-6 border-t border-neutral-900 pt-3 pb-4">
      <h2 className={cn(plexMono.className, "text-[0.68rem] font-medium tracking-wider text-neutral-500 uppercase")}>
        {label}
      </h2>
      <div>{children}</div>
    </section>
  )
}

export function CompactTemplate({ data }: TemplateProps) {
  const { personalInfo: p, experience, education, projects, skills, certifications } = data
  const contacts = contactItems(p)
  const mono = cn(plexMono.className, "text-[0.72rem] text-neutral-500 tabular-nums")

  return (
    <div className={cn(plexSans.className, "px-2 text-[0.8rem] leading-[1.45] text-neutral-900")}>
      <header className="grid grid-cols-[1fr_auto] items-end gap-6 pb-5">
        <div>
          <h1 className="text-[2rem] leading-none font-semibold tracking-tight">{p.name || "Your Name"}</h1>
          {p.role && <p className="mt-1.5 text-[0.95rem] text-neutral-600">{p.role}</p>}
        </div>
        {contacts.length > 0 && (
          <ul className={cn(plexMono.className, "text-right text-[0.7rem] leading-relaxed text-neutral-700")}>
            {contacts.map((c) => (
              <li key={c.key}>{c.href ? <A href={c.href}>{c.label}</A> : c.label}</li>
            ))}
          </ul>
        )}
      </header>

      {p.summary && (
        <Row label="Profile">
          <p className="max-w-[60ch]">{p.summary}</p>
        </Row>
      )}

      {experience.length > 0 && (
        <Row label="Experience">
          <div className="space-y-3">
            {experience.map((e, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-4">
                  <p>
                    <span className="font-semibold">{e.role}</span>
                    <span className="text-neutral-600"> — {[e.company, e.location].filter(Boolean).join(", ")}</span>
                  </p>
                  <span className={cn(mono, "shrink-0")}>{e.date}</span>
                </div>
                {e.achievements.length > 0 && (
                  <ul className="mt-1 list-[square] space-y-0.5 pl-4 marker:text-neutral-400">
                    {e.achievements.map((a, j) => (
                      <li key={j}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Row>
      )}

      {projects.length > 0 && (
        <Row label="Projects">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {projects.map((pr, i) => (
              <div key={i}>
                <p className="font-semibold">
                  {href(pr.url) ? <A href={href(pr.url)}>{pr.name} ↗</A> : pr.name}
                </p>
                {pr.description && <p className="text-neutral-700">{pr.description}</p>}
                {pr.technologies.length > 0 && <p className={cn(mono, "mt-0.5")}>{pr.technologies.join(" / ")}</p>}
              </div>
            ))}
          </div>
        </Row>
      )}

      {(skills.technical.length > 0 || skills.soft.length > 0) && (
        <Row label="Skills">
          {skills.technical.length > 0 && (
            <p>
              <span className="font-semibold">Technical: </span>
              {skills.technical.join(", ")}
            </p>
          )}
          {skills.soft.length > 0 && (
            <p className="mt-0.5">
              <span className="font-semibold">Other: </span>
              {skills.soft.join(", ")}
            </p>
          )}
        </Row>
      )}

      {education.length > 0 && (
        <Row label="Education">
          <div className="space-y-1">
            {education.map((ed, i) => (
              <div key={i} className="flex items-baseline justify-between gap-4">
                <p>
                  <span className="font-semibold">{ed.degree}</span>
                  <span className="text-neutral-600"> — {[ed.school, ed.location].filter(Boolean).join(", ")}</span>
                </p>
                <span className={cn(mono, "shrink-0")}>{ed.date}</span>
              </div>
            ))}
          </div>
        </Row>
      )}

      {certifications.length > 0 && (
        <Row label="Certificates">
          <div className="space-y-0.5">
            {certifications.map((c, i) => (
              <div key={i} className="flex items-baseline justify-between gap-4">
                <p>
                  <span className="font-semibold">{c.name}</span>
                  {c.issuer && <span className="text-neutral-600"> — {c.issuer}</span>}
                </p>
                <span className={cn(mono, "shrink-0")}>{c.date}</span>
              </div>
            ))}
          </div>
        </Row>
      )}
    </div>
  )
}
