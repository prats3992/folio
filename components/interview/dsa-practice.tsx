"use client"

import { useEffect, useState, useTransition } from "react"
import { CheckCircle2, Clock, Code, History, Lightbulb, Plus, Trophy, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Markdown } from "@/components/markdown"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { newChallenge, revealHint, submitSolution } from "@/lib/actions/dsa"
import type { ClientChallenge } from "@/lib/dsa"
import { cn } from "@/lib/utils"

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`

function Elapsed({ since }: { since: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  return <span className="tabular-nums">{fmt(Math.max(0, Math.floor((now - new Date(since).getTime()) / 1000)))}</span>
}

export function DsaPractice({ skillLevel: initialLevel, challenges: initial }: { skillLevel: string; challenges: ClientChallenge[] }) {
  const [pending, startTransition] = useTransition()
  const [action, setAction] = useState<"new" | "hint" | "submit" | null>(null)
  const [level, setLevel] = useState(initialLevel)
  const [challenges, setChallenges] = useState(initial)
  const [currentId, setCurrentId] = useState<string | null>(initial[0]?.id ?? null)
  const [solution, setSolution] = useState("")
  const current = challenges.find((c) => c.id === currentId) ?? null

  const upsert = (c: ClientChallenge) =>
    setChallenges((list) => (list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? c : x)) : [c, ...list]))

  const go = (kind: typeof action, fn: () => Promise<void>) => {
    setAction(kind)
    startTransition(async () => {
      await fn()
      setAction(null)
    })
  }

  const create = () =>
    go("new", async () => {
      const res = await newChallenge()
      if (!res.ok) return void toast.error(res.error)
      upsert(res.data)
      setCurrentId(res.data.id)
      setSolution("")
    })

  const hint = () =>
    current &&
    go("hint", async () => {
      const res = await revealHint(current.id)
      if (!res.ok) return void toast.error(res.error)
      upsert(res.data)
    })

  const submit = () =>
    current &&
    go("submit", async () => {
      const res = await submitSolution(current.id, solution)
      if (!res.ok) return void toast.error(res.error)
      upsert(res.data.challenge)
      if (res.data.newLevel !== res.data.previousLevel) {
        setLevel(res.data.newLevel)
        toast.info(`Skill level changed: ${res.data.previousLevel} → ${res.data.newLevel}`)
      }
    })

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
      <div className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow mb-2">Interview prep · DSA</p>
            <h1 className="display text-4xl sm:text-5xl">Practice problems</h1>
            <p className="text-sm text-muted-foreground">
              Your level: <span className="font-medium text-foreground capitalize">{level}</span> — solve cleanly and fast to level
              up.
            </p>
          </div>
          <Button onClick={create} disabled={pending}>
            {action === "new" ? <Spinner /> : <Plus />} {action === "new" ? "Generating… (up to a minute)" : "New challenge"}
          </Button>
        </div>

        {!current ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Code />
              </EmptyMedia>
              <EmptyTitle>No challenge yet</EmptyTitle>
              <EmptyDescription>Generate a problem matched to your level. Hints are available if you get stuck.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={create} disabled={pending}>
                {action === "new" && <Spinner />} Start practising
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{current.problem.difficulty}</Badge>
                  <Badge variant="secondary">{current.problem.category}</Badge>
                  {!current.result && (
                    <span className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="size-4" /> <Elapsed since={current.createdAt} />
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl">{current.problem.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Markdown>{current.problem.description}</Markdown>
                {current.problem.constraints.length > 0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Constraints</h4>
                    <ul className="list-inside list-disc text-sm text-muted-foreground">
                      {current.problem.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Sample input</h4>
                    <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{current.problem.sampleInput}</pre>
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Sample output</h4>
                    <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{current.problem.sampleOutput}</pre>
                  </div>
                </div>
                {current.hints.map((h, i) => (
                  <Alert key={i}>
                    <Lightbulb />
                    <AlertTitle>Hint {i + 1}</AlertTitle>
                    <AlertDescription>{h}</AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>

            {current.result ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {current.result.success ? (
                      <CheckCircle2 className="size-5 text-emerald-600" />
                    ) : (
                      <XCircle className="size-5 text-red-600" />
                    )}
                    {current.result.success ? "Accepted" : "Not quite"}
                    <span className="ml-auto text-sm font-normal text-muted-foreground">
                      Score {current.result.score}/10 · {fmt(current.result.timeSpentSec)} · {current.hintsUsed} hint
                      {current.hintsUsed === 1 ? "" : "s"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="feedback">
                    <TabsList>
                      <TabsTrigger value="feedback">Feedback</TabsTrigger>
                      <TabsTrigger value="yours">Your solution</TabsTrigger>
                      <TabsTrigger value="reference">Reference solution</TabsTrigger>
                    </TabsList>
                    <TabsContent value="feedback" className="pt-3">
                      <Markdown>{current.result.feedback}</Markdown>
                    </TabsContent>
                    <TabsContent value="yours" className="pt-3">
                      <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{current.result.userSolution}</pre>
                    </TabsContent>
                    <TabsContent value="reference" className="space-y-3 pt-3">
                      <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{current.result.solution}</pre>
                      <Markdown>{current.result.explanation}</Markdown>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Your solution</CardTitle>
                  <CardDescription>Code in any language or clear pseudocode. Explain complexity for bonus points.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    rows={14}
                    maxLength={10000}
                    spellCheck={false}
                    className="font-mono text-sm"
                    placeholder={"def solve(...):\n    ..."}
                    aria-label="Your solution"
                  />
                </CardContent>
                <CardFooter className="flex flex-wrap justify-between gap-2">
                  <Button
                    variant="outline"
                    onClick={hint}
                    disabled={pending || current.hintsUsed >= current.totalHints}
                  >
                    {action === "hint" ? <Spinner /> : <Lightbulb />} Hint ({current.totalHints - current.hintsUsed} left)
                  </Button>
                  <Button onClick={submit} disabled={pending || solution.trim().length < 20}>
                    {action === "submit" && <Spinner />} {action === "submit" ? "Grading…" : "Submit solution"}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </>
        )}
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="size-4" /> History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {challenges.length === 0 && <p className="text-sm text-muted-foreground">Nothing yet.</p>}
          {challenges.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCurrentId(c.id)
                setSolution("")
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                c.id === currentId && "bg-muted font-medium",
              )}
            >
              {c.result ? (
                c.result.success ? (
                  <Trophy className="size-4 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="size-4 shrink-0 text-red-600" />
                )
              ) : (
                <Clock className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="truncate">{c.problem.title}</span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
