"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { submitFeedback } from "@/lib/actions/feedback"
import { FEEDBACK_FEATURES, feedbackSchema, type FeedbackInput } from "@/lib/feedback/schema"

export function FeedbackForm({ defaultName }: { defaultName: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const form = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      title: "",
      experience: "",
      feature: undefined,
      sentiment: "positive",
      name: defaultName,
      role: "",
      company: "",
    },
  })

  const onSubmit = (values: FeedbackInput) =>
    startTransition(async () => {
      const res = await submitFeedback(values)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success("Thanks for your feedback!")
      router.push("/blog")
    })

  const text = (name: "title" | "name" | "role" | "company", label: string, placeholder: string) => (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input id={name} placeholder={placeholder} aria-invalid={fieldState.invalid} {...field} />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        {text("title", "Feedback title", "E.g. The mock interview felt real")}

        <Controller
          control={form.control}
          name="experience"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="experience">Your experience</FieldLabel>
              <Textarea id="experience" className="min-h-32" aria-invalid={fieldState.invalid} {...field} />
              <FieldDescription>What worked, what didn&apos;t, what you&apos;d like to see.</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="feature"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Feature</FieldLabel>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Select a feature" />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_FEATURES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="sentiment"
          render={({ field }) => (
            <FieldSet>
              <FieldLegend variant="label">Overall sentiment</FieldLegend>
              <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6">
                {(["positive", "neutral", "negative"] as const).map((v) => (
                  <Field key={v} orientation="horizontal" className="w-auto">
                    <RadioGroupItem value={v} id={`s-${v}`} />
                    <FieldLabel htmlFor={`s-${v}`} className="font-normal capitalize">
                      {v}
                    </FieldLabel>
                  </Field>
                ))}
              </RadioGroup>
            </FieldSet>
          )}
        />

        <div className="grid gap-4 rounded-lg bg-muted/40 p-4 md:grid-cols-3">
          {text("name", "Name", "Your name")}
          {text("role", "Role", "Your job title")}
          {text("company", "Company", "Company or university")}
        </div>
      </FieldGroup>

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending && <Spinner />} Submit feedback
      </Button>
    </form>
  )
}
