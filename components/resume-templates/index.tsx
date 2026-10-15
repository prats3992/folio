import type { ComponentType } from "react"
import type { ResumeData } from "@/lib/resume/schema"
import { isTemplateId, type TemplateId } from "@/lib/resume/templates"
import type { TemplateProps } from "./types"
import { ClassicTemplate } from "./classic"
import { CompactTemplate } from "./compact"
import { EditorialTemplate } from "./editorial"
import { GeometricTemplate } from "./geometric"
import { GlassTemplate } from "./glass"
import { InfographicTemplate } from "./infographic"
import { LuxuryTemplate } from "./luxury"
import { MinimalTemplate } from "./minimal"
import { PolishedTemplate } from "./polished"
import { TimelineTemplate } from "./timeline"

const COMPONENTS: Record<TemplateId, ComponentType<TemplateProps>> = {
  classic: ClassicTemplate,
  editorial: EditorialTemplate,
  compact: CompactTemplate,
  minimal: MinimalTemplate,
  glass: GlassTemplate,
  luxury: LuxuryTemplate,
  timeline: TimelineTemplate,
  infographic: InfographicTemplate,
  polished: PolishedTemplate,
  geometric: GeometricTemplate,
}

// templates designed before certifications existed get a neutral block appended
const NEEDS_CERT_FOOTER = new Set<TemplateId>(["minimal", "polished", "timeline", "glass", "geometric", "infographic", "luxury"])

function CertificationsFooter({ data, dark }: { data: ResumeData; dark?: boolean }) {
  if (!data.certifications.length) return null
  return (
    <section className={dark ? "-mx-6 -mb-6 bg-navy-900 px-14 pb-10 text-white/80 sm:-mx-8 sm:-mb-8 print:m-0" : "mt-6 px-2"}>
      <h2 className={dark ? "mb-2 text-sm font-semibold text-amber-300" : "mb-2 border-b border-gray-300 pb-1 text-base font-semibold"}>
        Certifications
      </h2>
      <ul className="space-y-0.5 text-sm">
        {data.certifications.map((c, i) => (
          <li key={i}>
            <span className="font-medium">{c.name}</span>
            {(c.issuer || c.date) && <span className="opacity-70"> — {[c.issuer, c.date].filter(Boolean).join(", ")}</span>}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Renders a resume with the given template. Always light-themed so it prints the same. */
export function ResumeRenderer({ template, data }: { template: string; data: ResumeData }) {
  const id: TemplateId = isTemplateId(template) ? template : "minimal"
  const Component = COMPONENTS[id]
  return (
    <div className="resume-sheet bg-white p-6 text-gray-900 [overflow-wrap:anywhere] sm:p-8 [&_svg]:shrink-0" data-template={template}>
      <Component data={data} />
      {NEEDS_CERT_FOOTER.has(id) && <CertificationsFooter data={data} dark={id === "luxury"} />}
    </div>
  )
}
