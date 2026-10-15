import type { Metadata } from "next"
import Link from "next/link"
import { desc, eq } from "drizzle-orm"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { db, schema } from "@/lib/db"

export const metadata: Metadata = { title: "Reviews" }
export const revalidate = 300

const monthFmt = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" })

async function loadFeedback() {
  try {
    return await db
      .select()
      .from(schema.feedback)
      .where(eq(schema.feedback.isApproved, true))
      .orderBy(desc(schema.feedback.createdAt))
      .limit(60)
  } catch (error) {
    console.error("[blog] failed to load feedback", error)
    return []
  }
}

export default async function BlogPage() {
  const rows = await loadFeedback()
  const featured = rows.filter((r) => r.sentiment === "positive" && r.experience.length > 160).slice(0, 2)
  const rest = rows.filter((r) => !featured.includes(r))

  return (
    <>
      <PageHeader
        eyebrow="Reviews"
        title="Notes from people who used it."
        lede="Feedback sent through the form linked at the bottom of every page — the good, the neutral and the critical."
      >
        <Button variant="outline" asChild>
          <Link href="/feedback">Leave feedback</Link>
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 pb-24">
        {rows.length === 0 && (
          <p className="py-24 text-center text-muted-foreground">
            No reviews yet.{" "}
            <Link href="/feedback" className="text-foreground underline underline-offset-4">
              Be the first
            </Link>
            .
          </p>
        )}

        {featured.length > 0 && (
          <section className="grid gap-12 border-b py-14 md:grid-cols-2">
            {featured.map((r) => (
              <figure key={r.id}>
                <blockquote className="display text-[1.75rem] leading-snug">“{r.experience}”</blockquote>
                <figcaption className="mt-6 text-sm">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — {r.role}, {r.company}
                  </span>
                </figcaption>
              </figure>
            ))}
          </section>
        )}

        {rest.length > 0 && (
          <section className="mt-14 grid gap-px overflow-hidden border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((r) => (
              <article
                key={r.id}
                className="flex flex-col bg-background p-7"
              >
                <p className="eyebrow mb-3 flex justify-between">
                  <span>{r.feature}</span>
                  <span>{monthFmt.format(r.createdAt)}</span>
                </p>
                <h2 className="display text-2xl">{r.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{r.experience}</p>
                <p className="mt-5 text-sm">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-muted-foreground"> · {r.role}</span>
                </p>
              </article>
            ))}
          </section>
        )}
      </div>
    </>
  )
}
