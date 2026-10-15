import { ToolHeader } from "@/components/tool-header"
import type { Metadata } from "next"
import { desc, eq } from "drizzle-orm"
import { JobMatch } from "@/components/interview/job-match"
import { db, schema } from "@/lib/db"
import { getResumeOptions } from "@/lib/queries"
import { requireUser } from "@/lib/session"

export const metadata: Metadata = { title: "Job match" }
export const maxDuration = 120

export default async function JobMatchPage() {
  const user = await requireUser()
  const [options, rows] = await Promise.all([
    getResumeOptions(user.id),
    db
      .select({
        id: schema.jobAnalysis.id,
        jobTitle: schema.jobAnalysis.jobTitle,
        createdAt: schema.jobAnalysis.createdAt,
        result: schema.jobAnalysis.result,
      })
      .from(schema.jobAnalysis)
      .where(eq(schema.jobAnalysis.userId, user.id))
      .orderBy(desc(schema.jobAnalysis.createdAt))
      .limit(20),
  ])
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <ToolHeader eyebrow="Interview prep · Job match" title="How well do you fit this job?" lede="Paste a job post. You get a match score, the skills and experience you're missing, and specific edits for your resume." />
      <JobMatch
        options={options}
        defaultResumeId={user.primaryResumeId}
        history={rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
      />
    </div>
  )
}
