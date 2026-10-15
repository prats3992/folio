import { ToolHeader } from "@/components/tool-header"
import type { Metadata } from "next"
import { desc, eq } from "drizzle-orm"
import { StarQuestions } from "@/components/interview/star-questions"
import { db, schema } from "@/lib/db"
import { getResumeOptions } from "@/lib/queries"
import { requireUser } from "@/lib/session"

export const metadata: Metadata = { title: "STAR questions" }
export const maxDuration = 120

export default async function StarPage() {
  const user = await requireUser()
  const [options, rows] = await Promise.all([
    getResumeOptions(user.id),
    db
      .select({
        id: schema.behavioralSet.id,
        jobTitle: schema.behavioralSet.jobTitle,
        createdAt: schema.behavioralSet.createdAt,
        questions: schema.behavioralSet.questions,
      })
      .from(schema.behavioralSet)
      .where(eq(schema.behavioralSet.userId, user.id))
      .orderBy(desc(schema.behavioralSet.createdAt))
      .limit(20),
  ])
  const primary = options.find((o) => o.id === user.primaryResumeId)
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <ToolHeader eyebrow="Interview prep · STAR" title="Behavioural questions, from your own story." lede="Five questions tailored to the role and your background, with a frame for each part of a Situation–Task–Action–Result answer." />
      <StarQuestions
        options={options}
        defaultResumeId={primary?.id ?? null}
        defaultJobTitle={primary?.targetRole ?? ""}
        history={rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
      />
    </div>
  )
}
