"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Mic } from "lucide-react"
import { toast } from "sonner"
import { ResumeSelect, type ResumeOption } from "@/components/interview/resume-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { createChat } from "@/lib/actions/chat"

export function NewChatForm({
  options,
  defaultKind,
  defaultResumeId,
}: {
  options: ResumeOption[]
  defaultKind: "general" | "mock_interview"
  defaultResumeId: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [kind, setKind] = useState(defaultKind)
  const [resumeId, setResumeId] = useState<string | null>(defaultResumeId)
  const [role, setRole] = useState(options.find((o) => o.id === defaultResumeId)?.targetRole ?? "")

  function start() {
    startTransition(async () => {
      const res = await createChat({ kind, resumeId, targetRole: role })
      if (!res.ok) return void toast.error(res.error)
      router.push(`/interview/${res.data.id}`)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{kind === "mock_interview" ? "Start a mock interview" : "Start a coaching chat"}</CardTitle>
        <CardDescription>
          {kind === "mock_interview"
            ? "The interviewer asks one question at a time, gives quick feedback, and scores you when you type “end”."
            : "Ask about interview strategy, your resume, salary negotiation — anything career related."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <ToggleGroup
            type="single"
            variant="outline"
            value={kind}
            onValueChange={(v) => v && setKind(v as typeof kind)}
            className="w-full"
          >
            <ToggleGroupItem value="general" className="flex-1">
              <MessageSquare /> Coaching chat
            </ToggleGroupItem>
            <ToggleGroupItem value="mock_interview" className="flex-1">
              <Mic /> Mock interview
            </ToggleGroupItem>
          </ToggleGroup>
          <Field>
            <FieldLabel>Resume</FieldLabel>
            <ResumeSelect
              options={options}
              value={resumeId}
              allowNone
              onChange={(id) => {
                setResumeId(id)
                const o = options.find((x) => x.id === id)
                if (o?.targetRole) setRole(o.targetRole)
              }}
            />
            <FieldDescription>The coach tailors questions and advice to this resume.</FieldDescription>
          </Field>
          {kind === "mock_interview" && (
            <Field>
              <FieldLabel htmlFor="role">Role you&apos;re interviewing for</FieldLabel>
              <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} maxLength={120} placeholder="e.g. Backend Engineer at a fintech" />
            </Field>
          )}
        </FieldGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={start} disabled={pending} className="w-full" size="lg">
          {pending && <Spinner />} {kind === "mock_interview" ? "Start interview" : "Start chat"}
        </Button>
      </CardFooter>
    </Card>
  )
}
