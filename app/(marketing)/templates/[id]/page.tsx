import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ResumeRenderer } from "@/components/resume-templates"
import { ScaledPreview } from "@/components/resume/scaled-preview"
import { Button } from "@/components/ui/button"
import { SAMPLE_RESUME } from "@/lib/resume/sample"
import { getTemplateMeta, isTemplateId, TEMPLATES } from "@/lib/resume/templates"

type Props = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ id: t.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: `${getTemplateMeta(id).name} template` }
}

export default async function TemplatePage({ params }: Props) {
  const { id } = await params
  if (!isTemplateId(id)) notFound()
  const t = getTemplateMeta(id)
  const i = TEMPLATES.findIndex((x) => x.id === id)
  const prev = TEMPLATES[(i - 1 + TEMPLATES.length) % TEMPLATES.length]
  const next = TEMPLATES[(i + 1) % TEMPLATES.length]
  return (
    <div className="bg-muted/40">
      <div className="mx-auto flex max-w-[816px] flex-wrap items-end justify-between gap-4 px-4 pt-10 pb-6">
        <div>
          <p className="eyebrow mb-2">
            Template {String(i + 1).padStart(2, "0")} of {String(TEMPLATES.length).padStart(2, "0")} · {t.tags.join(" · ")}
          </p>
          <h1 className="display text-5xl">{t.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
        </div>
        <Button asChild>
          <Link href={`/resume/new?template=${t.id}`}>Use {t.name}</Link>
        </Button>
      </div>
      <div className="mx-auto max-w-[816px] px-3 pb-6 sm:px-4">
        <div className="overflow-hidden rounded-sm shadow-[0_24px_48px_-28px_rgb(40_30_10/0.45)]">
          <ScaledPreview>
            <ResumeRenderer template={t.id} data={SAMPLE_RESUME} />
          </ScaledPreview>
        </div>
      </div>
      <nav className="mx-auto flex max-w-[816px] justify-between px-4 pb-16 text-sm">
        <Link href={`/templates/${prev.id}`} className="hover:underline">
          ← {prev.name}
        </Link>
        <Link href="/templates" className="text-muted-foreground hover:underline">
          All templates
        </Link>
        <Link href={`/templates/${next.id}`} className="hover:underline">
          {next.name} →
        </Link>
      </nav>
    </div>
  )
}
