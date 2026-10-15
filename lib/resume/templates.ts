// Template metadata (safe to import from server and client code).
export const TEMPLATES = [
  { id: "classic", name: "Classic", description: "Traditional serif layout — the safest choice for formal applications", tags: ["ATS-friendly", "Serif"] },
  { id: "editorial", name: "Editorial", description: "Two columns: facts in a quiet sidebar, your story in the main column", tags: ["Two-column", "Serif"] },
  { id: "compact", name: "Compact", description: "Dense Swiss-style grid that fits a lot on one page — great for engineers", tags: ["ATS-friendly", "Dense"] },
  { id: "minimal", name: "Minimal", description: "Clean, centred single column focusing on content", tags: ["ATS-friendly", "Sans"] },
  { id: "polished", name: "Polished", description: "Professional two-column layout with a bold header", tags: ["Two-column", "Colour"] },
  { id: "timeline", name: "Timeline", description: "Chronological layout with a visual timeline", tags: ["Visual"] },
  { id: "glass", name: "Glass", description: "Soft panels with a blue accent", tags: ["Colour"] },
  { id: "geometric", name: "Geometric", description: "Dark header with geometric accents", tags: ["Bold"] },
  { id: "infographic", name: "Infographic", description: "Stats and highlights at a glance", tags: ["Visual", "Creative"] },
  { id: "luxury", name: "Luxury", description: "Dark navy with gold accents — best viewed on screen", tags: ["Dark", "Bold"] },
] as const

export type TemplateId = (typeof TEMPLATES)[number]["id"]
export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id) as TemplateId[]

export const isTemplateId = (v: unknown): v is TemplateId =>
  typeof v === "string" && (TEMPLATE_IDS as string[]).includes(v)

export const getTemplateMeta = (id: string) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
