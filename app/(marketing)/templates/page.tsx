import type { Metadata } from "next"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { ResumeRenderer } from "@/components/resume-templates"
import { ScaledPreview } from "@/components/resume/scaled-preview"
import { Button } from "@/components/ui/button"
import { SAMPLE_RESUME } from "@/lib/resume/sample"
import { TEMPLATES } from "@/lib/resume/templates"

export const metadata: Metadata = { title: "Templates" }

export default function TemplatesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Templates"
        title={
          <>
            Ten layouts. <em className="text-primary">Same content.</em>
          </>
        }
        lede="Switch between them any time — your words stay put. Classic, Compact and Minimal are the safest choices for applicant-tracking systems."
      />
      <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-14 px-4 py-14 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t, i) => (
          <article key={t.id} className="flex flex-col">
            <Link href={`/templates/${t.id}`} aria-label={`Preview ${t.name}`} className="block transition-transform hover:-translate-y-1">
              <ScaledPreview ratio={1.22} className="rounded-sm shadow-[0_20px_40px_-28px_rgb(40_30_10/0.4)]">
                <ResumeRenderer template={t.id} data={SAMPLE_RESUME} />
              </ScaledPreview>
            </Link>
            <div className="mt-5 flex items-baseline justify-between gap-3 border-t pt-4">
              <h2 className="display text-3xl">
                <span className="mr-3 font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                {t.name}
              </h2>
              <span className="eyebrow">{t.tags.join(" · ")}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/templates/${t.id}`}>Full preview</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/resume/new?template=${t.id}`}>Use {t.name}</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
