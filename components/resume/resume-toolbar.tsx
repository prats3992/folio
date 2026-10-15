"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Copy, Link2, MessagesSquare, Pencil, Printer } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { setResumeSharing, setResumeTemplate } from "@/lib/actions/resume"
import { TEMPLATES } from "@/lib/resume/templates"

export function ResumeToolbar({
  id,
  template,
  isPublic,
  shareSlug,
}: {
  id: string
  template: string
  isPublic: boolean
  shareSlug: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [shared, setShared] = useState(isPublic)
  const [slug, setSlug] = useState(shareSlug)
  const [copied, setCopied] = useState(false)
  const shareUrl = slug && typeof window !== "undefined" ? `${window.location.origin}/r/${slug}` : ""

  function changeTemplate(t: string) {
    startTransition(async () => {
      const res = await setResumeTemplate(id, t)
      if (!res.ok) toast.error(res.error)
      router.refresh()
    })
  }

  function toggleShare(on: boolean) {
    setShared(on)
    startTransition(async () => {
      const res = await setResumeSharing(id, on)
      if (!res.ok) {
        setShared(!on)
        return void toast.error(res.error)
      }
      if (res.data.shareSlug) setSlug(res.data.shareSlug)
      toast.success(on ? "Public link enabled" : "Public link disabled")
    })
  }

  async function copy() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="no-print sticky top-16 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft /> Dashboard
          </Link>
        </Button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Select value={template} onValueChange={changeTemplate} disabled={pending}>
            <SelectTrigger size="sm" className="w-32 sm:w-36" aria-label="Template">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/resume/${id}/edit`}>
              <Pencil /> Edit
            </Link>
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Link2 /> Share
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="share">Public link</Label>
                <Switch id="share" checked={shared} onCheckedChange={toggleShare} disabled={pending} />
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with the link can view this resume (read-only). Turn it off any time.
              </p>
              {shared && shareUrl && (
                <div className="flex gap-2">
                  <Input readOnly value={shareUrl} className="text-xs" onFocus={(e) => e.currentTarget.select()} />
                  <Button size="icon" variant="outline" onClick={copy} aria-label="Copy link">
                    {copied ? <Check /> : <Copy />}
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/interview/new?kind=mock_interview&resumeId=${id}`}>
              <MessagesSquare /> <span className="hidden sm:inline">Practise interview</span>
              <span className="sm:hidden">Practise</span>
            </Link>
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer /> <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
