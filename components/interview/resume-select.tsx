"use client"

import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type ResumeOption = { id: string; title: string; targetRole: string }

export function ResumeSelect({
  options,
  value,
  onChange,
  allowNone = false,
}: {
  options: ResumeOption[]
  value: string | null
  onChange: (id: string | null) => void
  allowNone?: boolean
}) {
  if (options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No resumes yet —{" "}
        <Link href="/resume/new" className="text-primary hover:underline">
          create one
        </Link>{" "}
        for personalised results.
      </p>
    )
  }
  return (
    <Select value={value ?? "none"} onValueChange={(v) => onChange(v === "none" ? null : v)}>
      <SelectTrigger className="w-full" aria-label="Resume">
        <SelectValue placeholder="Choose a resume" />
      </SelectTrigger>
      <SelectContent>
        {allowNone && <SelectItem value="none">Don&apos;t use a resume</SelectItem>}
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.title}
            {o.targetRole ? ` · ${o.targetRole}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
