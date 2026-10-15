import type { ResumeData } from "@/lib/resume/schema"

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")).toUpperCase()
}

/** Rough total years from date strings like "Jan 2021 - Present" or "2019–2022". */
export function yearsOfExperience(experience: ResumeData["experience"]) {
  const now = new Date().getFullYear()
  let total = 0
  for (const e of experience) {
    const years = e.date.match(/\b(19|20)\d{2}\b/g)?.map(Number) ?? []
    if (!years.length) continue
    const end = /present|current|now/i.test(e.date) ? now : Math.max(...years)
    total += Math.max(0, end - Math.min(...years))
  }
  return total
}

/** Adds https:// to bare domains; refuses non-http(s) schemes such as javascript:. */
export function href(url: string) {
  const u = url.trim()
  if (!u) return undefined
  if (/^https?:\/\//i.test(u)) return u
  if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return undefined
  return `https://${u}`
}

export type ContactItem = { key: string; label: string; href?: string }

/** Contact details in a consistent order, with display labels stripped of protocol noise. */
export function contactItems(p: ResumeData["personalInfo"]): ContactItem[] {
  const clean = (u: string) => u.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "")
  const items: (ContactItem | null)[] = [
    p.email ? { key: "email", label: p.email, href: `mailto:${p.email}` } : null,
    p.phone ? { key: "phone", label: p.phone, href: `tel:${p.phone.replace(/[^\d+]/g, "")}` } : null,
    p.location ? { key: "location", label: p.location } : null,
    p.linkedin ? { key: "linkedin", label: clean(p.linkedin), href: href(p.linkedin) } : null,
    p.github ? { key: "github", label: clean(p.github), href: href(p.github) } : null,
    p.website ? { key: "website", label: clean(p.website), href: href(p.website) } : null,
  ]
  return items.filter((x): x is ContactItem => x !== null)
}
