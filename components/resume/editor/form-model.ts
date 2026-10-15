import type { ResumeData } from "@/lib/resume/schema"
import type { TemplateId } from "@/lib/resume/templates"

// Editor-friendly shape: string lists are edited as text (one per line / comma separated).
export interface EditorValues {
  title: string
  targetRole: string
  template: TemplateId
  personalInfo: ResumeData["personalInfo"]
  experience: { role: string; company: string; location: string; date: string; achievements: string }[]
  education: ResumeData["education"]
  projects: { name: string; description: string; url: string; technologies: string }[]
  certifications: ResumeData["certifications"]
  skillsTechnical: string
  skillsSoft: string
}

const lines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean)
const commas = (s: string) =>
  s
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean)

export function toEditor(meta: { title: string; targetRole: string; template: TemplateId }, d: ResumeData): EditorValues {
  return {
    ...meta,
    personalInfo: { ...d.personalInfo },
    experience: d.experience.map((e) => ({ ...e, achievements: e.achievements.join("\n") })),
    education: d.education.map((e) => ({ ...e })),
    projects: d.projects.map((p) => ({ ...p, technologies: p.technologies.join(", ") })),
    certifications: d.certifications.map((c) => ({ ...c })),
    skillsTechnical: d.skills.technical.join(", "),
    skillsSoft: d.skills.soft.join(", "),
  }
}

export function fromEditor(v: EditorValues): ResumeData {
  return {
    personalInfo: v.personalInfo,
    experience: v.experience.map((e) => ({ ...e, achievements: lines(e.achievements) })),
    education: v.education,
    projects: v.projects.map((p) => ({ ...p, technologies: commas(p.technologies) })),
    certifications: v.certifications,
    skills: { technical: commas(v.skillsTechnical), soft: commas(v.skillsSoft) },
  }
}

export const EMPTY = {
  experience: { role: "", company: "", location: "", date: "", achievements: "" },
  education: { degree: "", school: "", location: "", date: "" },
  project: { name: "", description: "", url: "", technologies: "" },
  certification: { name: "", issuer: "", date: "" },
}
