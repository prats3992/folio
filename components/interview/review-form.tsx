"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ResumeSelect, type ResumeOption } from "@/components/interview/resume-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { startResumeReview } from "@/lib/actions/chat"

export function ReviewForm({ options, defaultResumeId }: { options: ResumeOption[]; defaultResumeId: string | null }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [resumeId, setResumeId] = useState<string | null>(defaultResumeId ?? options[0]?.id ?? null)

  function run() {
    if (!resumeId) return
    startTransition(async () => {
      const res = await startResumeReview(resumeId)
      if (!res.ok) return void toast.error(res.error)
      router.push(`/interview/${res.data.id}`)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a resume</CardTitle>
        <CardDescription>The review uses the resume&apos;s target role.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResumeSelect options={options} value={resumeId} onChange={setResumeId} />
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">
        <Button onClick={run} disabled={pending || !resumeId} size="lg">
          {pending && <Spinner />} {pending ? "Reviewing… (up to a minute)" : "Review my resume"}
        </Button>
      </CardFooter>
    </Card>
  )
}
