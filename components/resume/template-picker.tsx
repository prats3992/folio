"use client"

import { Check } from "lucide-react"
import { TEMPLATES, type TemplateId } from "@/lib/resume/templates"
import { cn } from "@/lib/utils"

export function TemplatePicker({
  value,
  onChange,
  previews,
}: {
  value: TemplateId
  onChange: (id: TemplateId) => void
  /** server-rendered thumbnails keyed by template id */
  previews: Record<string, React.ReactNode>
}) {
  return (
    <div role="radiogroup" aria-label="Template" className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {TEMPLATES.map((t) => {
        const selected = t.id === value
        return (
          // a div, not a <button>: the thumbnail contains links, which can't nest inside buttons
          <div
            key={t.id}
            role="radio"
            tabIndex={selected ? 0 : -1}
            aria-checked={selected}
            aria-label={t.name}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault()
                onChange(t.id)
              }
              const i = TEMPLATES.findIndex((x) => x.id === value)
              const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
              if (step) {
                e.preventDefault()
                onChange(TEMPLATES[(i + step + TEMPLATES.length) % TEMPLATES.length].id)
              }
            }}
            className={cn(
              "group relative cursor-pointer rounded-sm border-2 p-1 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected ? "border-primary" : "border-transparent hover:border-border",
            )}
          >
            {previews[t.id]}
            <span className="mt-1 block px-1 text-xs font-medium">{t.name}</span>
            {selected && (
              <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" />
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
