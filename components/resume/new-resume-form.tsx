"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { FileUp, PenLine, X } from "lucide-react"
import { toast } from "sonner"
import { TemplatePicker } from "@/components/resume/template-picker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { createBlankResume, createResumeFromUpload } from "@/lib/actions/resume"
import type { TemplateId } from "@/lib/resume/templates"
import { cn } from "@/lib/utils"

const ACCEPT = ".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
const STAGES = [
  "Reading your file…",
  "Extracting your experience, projects and skills…",
  "Tailoring bullet points to your target role…",
  "Almost there — free AI models can take up to a minute…",
]

export function NewResumeForm({
  initialTemplate,
  previews,
}: {
  initialTemplate: TemplateId
  previews: Record<string, React.ReactNode>
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [role, setRole] = useState("")
  const [template, setTemplate] = useState<TemplateId>(initialTemplate)
  const [pending, startTransition] = useTransition()
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (!pending) return
    const t = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 9000)
    return () => clearInterval(t)
  }, [pending])

  function pick(f: File | undefined) {
    if (!f) return
    if (f.size > 5 * 1024 * 1024) return toast.error("File is too large (max 5 MB).")
    if (!/\.(pdf|docx|txt)$/i.test(f.name)) return toast.error("Upload a PDF, DOCX or TXT file.")
    setFile(f)
  }

  function upload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return toast.error("Choose your resume file first.")
    const fd = new FormData()
    fd.set("file", file)
    fd.set("targetRole", role)
    fd.set("template", template)
    setStage(0)
    startTransition(async () => {
      const res = await createResumeFromUpload(fd)
      if (!res.ok) return void toast.error(res.error)
      toast.success("Resume created — review and tweak anything below.")
      router.push(`/resume/${res.data.id}/edit`)
    })
  }

  function blank() {
    startTransition(async () => {
      const res = await createBlankResume({ template, targetRole: role })
      if (!res.ok) return void toast.error(res.error)
      router.push(`/resume/${res.data.id}/edit`)
    })
  }

  return (
    <form onSubmit={upload} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle><span className="mr-2 font-mono text-primary">01</span>Your current resume</CardTitle>
          <CardDescription>PDF, DOCX or TXT up to 5 MB. Text is extracted on our server.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              pick(e.dataTransfer.files[0])
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed p-10 text-center transition-colors",
              dragging ? "border-primary bg-primary/5" : "border-border",
            )}
          >
            {file ? (
              <div className="flex items-center gap-3 rounded-md bg-muted px-3 py-2 text-sm">
                <FileUp className="size-4 text-primary" />
                <span className="max-w-64 truncate font-medium">{file.name}</span>
                <span className="text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
                <Button type="button" variant="ghost" size="icon-xs" onClick={() => setFile(null)} aria-label="Remove file">
                  <X />
                </Button>
              </div>
            ) : (
              <>
                <p className="display text-2xl">Drop your resume here</p>
                <p className="eyebrow">PDF · DOCX · TXT</p>
              </>
            )}
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
              {file ? "Choose a different file" : "Browse files"}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => pick(e.target.files?.[0])}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle><span className="mr-2 font-mono text-primary">02</span>Target role</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="role">What job are you applying for?</FieldLabel>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer, Data Analyst"
                maxLength={120}
              />
              <FieldDescription>We keep the most relevant experience and rewrite bullets for this role.</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle><span className="mr-2 font-mono text-primary">03</span>Template</CardTitle>
          <CardDescription>You can switch any time later.</CardDescription>
        </CardHeader>
        <CardContent>
          <TemplatePicker value={template} onChange={setTemplate} previews={previews} />
        </CardContent>
      </Card>

      {pending && file ? (
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Spinner /> {STAGES[stage]}
            </div>
            <Progress value={((stage + 1) / STAGES.length) * 90} />
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="ghost" onClick={blank} disabled={pending}>
          <PenLine /> Start from scratch instead
        </Button>
        <Button type="submit" size="lg" disabled={pending || !file || !role.trim()}>
          {pending && <Spinner />} Create my resume
        </Button>
      </div>
    </form>
  )
}
