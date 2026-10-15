"use client"

import { useState, useTransition } from "react"
import { Check, Copy, History } from "lucide-react"
import { toast } from "sonner"
import { ResumeSelect, type ResumeOption } from "@/components/interview/resume-select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { runBehavioralQuestions } from "@/lib/actions/tools"
import type { BehavioralQuestion } from "@/lib/ai/schemas"
import { cn } from "@/lib/utils"

export type StarSet = { id: string; jobTitle: string; createdAt: string; questions: BehavioralQuestion[] }

const STAR = [
  { key: "situation", label: "Situation" },
  { key: "task", label: "Task" },
  { key: "action", label: "Action" },
  { key: "result", label: "Result" },
] as const

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Copy question"
      onClick={async (e) => {
        e.stopPropagation()
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  )
}

export function StarQuestions({
  options,
  defaultResumeId,
  defaultJobTitle,
  history: initial,
}: {
  options: ResumeOption[]
  defaultResumeId: string | null
  defaultJobTitle: string
  history: StarSet[]
}) {
  const [pending, startTransition] = useTransition()
  const [resumeId, setResumeId] = useState(defaultResumeId)
  const [jobTitle, setJobTitle] = useState(defaultJobTitle)
  const [history, setHistory] = useState(initial)
  const [selected, setSelected] = useState<StarSet | null>(initial[0] ?? null)

  function generate(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await runBehavioralQuestions({ resumeId, jobTitle })
      if (!res.ok) return void toast.error(res.error)
      const set = { ...res.data, createdAt: new Date(res.data.createdAt).toISOString() }
      setHistory((h) => [set, ...h])
      setSelected(set)
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
<CardTitle>Generate a set</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={generate}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="jt">Job title</FieldLabel>
                  <Input id="jt" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} maxLength={120} placeholder="Product Manager" />
                </Field>
                <Field>
                  <FieldLabel>Resume</FieldLabel>
                  <ResumeSelect options={options} value={resumeId} onChange={setResumeId} allowNone />
                </Field>
                <Button type="submit" disabled={pending || jobTitle.trim().length < 2}>
                  {pending && <Spinner />} {pending ? "Generating… (up to a minute)" : "Generate 5 questions"}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <History className="size-4" /> Previous sets
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
                  <span className="truncate">{h.jobTitle}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="min-w-0">
        {selected ? (
          <Card>
            <CardHeader>
              <CardTitle>{selected.jobTitle}</CardTitle>
              <CardDescription>Open a question to see how to structure your answer.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible defaultValue="q-0">
                {selected.questions.map((q, i) => (
                  <AccordionItem key={i} value={`q-${i}`}>
                    <AccordionTrigger className="gap-3 text-left">
                      <span className="flex flex-col gap-1.5">
                        <Badge variant="secondary" className="w-fit capitalize">
                          {q.category}
                        </Badge>
                        <span>{q.question}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="mb-2 flex justify-end">
                        <CopyButton text={q.question} />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {STAR.map((s) => (
                          <div key={s.key} className="rounded-lg border bg-muted/30 p-3">
                            <p className="mb-1 text-xs font-semibold tracking-wide text-primary uppercase">{s.label}</p>
                            <p className="text-sm">{q.starPrompt[s.key]}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ) : (
          <div className="flex h-full min-h-64 items-center justify-center rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Your questions will appear here.
          </div>
        )}
      </div>
    </div>
  )
}
