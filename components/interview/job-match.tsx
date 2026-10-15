"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, History, Lightbulb, XCircle } from "lucide-react"
import { toast } from "sonner"
import { ResumeSelect, type ResumeOption } from "@/components/interview/resume-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { runJobAnalysis } from "@/lib/actions/tools"
import type { JobAnalysisResult } from "@/lib/ai/schemas"
import { cn } from "@/lib/utils"

export type JobAnalysisItem = { id: string; jobTitle: string; createdAt: string; result: JobAnalysisResult }

function List({ title, items, icon: Icon, tone }: { title: string; items: string[]; icon: typeof CheckCircle2; tone: string }) {
  if (!items.length) return null
  return (
    <div>
      <h4 className="mb-2 text-sm font-medium">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((s, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <Icon className={cn("mt-0.5 size-4 shrink-0", tone)} />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function JobMatchResult({ item }: { item: JobAnalysisItem }) {
  const r = item.result
  const tone = r.overallMatch >= 75 ? "text-emerald-600" : r.overallMatch >= 50 ? "text-amber-600" : "text-red-600"
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex min-w-0 items-center justify-between gap-4">
          <span className="min-w-0 truncate">{item.jobTitle || "Job match"}</span>
          <span className={cn("text-3xl font-bold tabular-nums", tone)}>{r.overallMatch}%</span>
        </CardTitle>
        <Progress value={r.overallMatch} />
        <CardDescription className="pt-2">{r.summary}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Matching skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {r.matchingSkills.map((s) => (
              <Badge key={s} variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                {s}
              </Badge>
            ))}
          </div>
          <h4 className="pt-2 text-sm font-medium">Missing skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {r.missingSkills.map((s) => (
              <Badge key={s} variant="secondary" className="bg-red-500/10 text-red-700 dark:text-red-400">
                {s}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <List title="Relevant experience" items={r.matchingExperience} icon={CheckCircle2} tone="text-emerald-600" />
          <List title="Experience gaps" items={r.missingExperience} icon={XCircle} tone="text-red-600" />
        </div>
        <div className="md:col-span-2">
          <List title="Suggested resume changes" items={r.suggestedChanges} icon={Lightbulb} tone="text-amber-500" />
        </div>
      </CardContent>
    </Card>
  )
}

export function JobMatch({
  options,
  defaultResumeId,
  history: initialHistory,
}: {
  options: ResumeOption[]
  defaultResumeId: string | null
  history: JobAnalysisItem[]
}) {
  const [pending, startTransition] = useTransition()
  const [resumeId, setResumeId] = useState<string | null>(defaultResumeId ?? options[0]?.id ?? null)
  const [jobTitle, setJobTitle] = useState("")
  const [jd, setJd] = useState("")
  const [history, setHistory] = useState(initialHistory)
  const [selected, setSelected] = useState<JobAnalysisItem | null>(initialHistory[0] ?? null)

  function analyze(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await runJobAnalysis({ resumeId, jobTitle, jobDescription: jd })
      if (!res.ok) return void toast.error(res.error)
      const item = { ...res.data, createdAt: new Date(res.data.createdAt).toISOString() }
      setHistory((h) => [item, ...h])
      setSelected(item)
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Analyse a job post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={analyze}>
              <FieldGroup>
                <Field>
                  <FieldLabel>Resume</FieldLabel>
                  <ResumeSelect options={options} value={resumeId} onChange={setResumeId} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="jt">Job title</FieldLabel>
                  <Input id="jt" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} maxLength={120} placeholder="Frontend Engineer at Acme" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="jd">Job description</FieldLabel>
                  <Textarea id="jd" value={jd} onChange={(e) => setJd(e.target.value)} rows={10} maxLength={15000} placeholder="Paste the full job post here…" />
                  <FieldDescription>{jd.length.toLocaleString()} / 15,000</FieldDescription>
                </Field>
                <Button type="submit" disabled={pending || !resumeId || jd.trim().length < 50}>
                  {pending && <Spinner />} {pending ? "Analysing… (up to a minute)" : "Analyse match"}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <History className="size-4" /> Previous analyses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSelected(h)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                    selected?.id === h.id && "bg-muted font-medium",
                  )}
                >
                  <span className="truncate">{h.jobTitle || "Untitled job"}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">{h.result.overallMatch}%</span>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
      <div className="min-w-0">
        {selected ? (
          <JobMatchResult item={selected} />
        ) : (
          <div className="flex h-full min-h-64 items-center justify-center rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Your analysis will appear here.
          </div>
        )}
      </div>
    </div>
  )
}
