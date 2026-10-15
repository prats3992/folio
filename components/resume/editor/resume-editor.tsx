"use client"

import { useDeferredValue, useEffect, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldArrayPath,
  type UseFormRegister,
} from "react-hook-form"
import { ArrowDown, ArrowLeft, ArrowUp, Eye, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ResumeRenderer } from "@/components/resume-templates"
import { ScaledPreview } from "@/components/resume/scaled-preview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { updateResume } from "@/lib/actions/resume"
import { TEMPLATES, type TemplateId } from "@/lib/resume/templates"
import { EMPTY, fromEditor, type EditorValues } from "./form-model"

type Reg = UseFormRegister<EditorValues>

function TextField({
  register,
  name,
  label,
  placeholder,
  type = "text",
}: {
  register: Reg
  name: Parameters<Reg>[0]
  label: string
  placeholder?: string
  type?: string
}) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input id={name} type={type} placeholder={placeholder} {...register(name)} />
    </Field>
  )
}

/** Generic repeatable section with add / remove / reorder. */
function ListSection<N extends FieldArrayPath<EditorValues>>({
  control,
  name,
  empty,
  addLabel,
  itemTitle,
  render,
}: {
  control: Control<EditorValues>
  name: N
  empty: Record<string, string>
  addLabel: string
  itemTitle: (i: number) => string
  render: (i: number) => React.ReactNode
}) {
  const { fields, append, remove, move } = useFieldArray({ control, name })
  return (
    <div className="space-y-4">
      {fields.map((f, i) => (
        <Card key={f.id} className="gap-4 py-4">
          <CardHeader className="flex flex-row items-center justify-between px-4">
            <CardTitle className="truncate text-sm">{itemTitle(i)}</CardTitle>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="icon-sm" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Move up">
                <ArrowUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={i === fields.length - 1}
                onClick={() => move(i, i + 1)}
                aria-label="Move down"
              >
                <ArrowDown />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(i)} aria-label="Remove">
                <Trash2 />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4">{render(i)}</CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the empty item matches the array element shape
        onClick={() => append(empty as any)}
      >
        <Plus /> {addLabel}
      </Button>
    </div>
  )
}

export function ResumeEditor({ id, initial }: { id: string; initial: EditorValues }) {
  const router = useRouter()
  const [saving, startTransition] = useTransition()
  const form = useForm<EditorValues>({ defaultValues: initial })
  const { register, control, handleSubmit, formState, reset, setValue } = form

  const values = useWatch({ control }) as EditorValues
  const preview = useDeferredValue(values)
  const watch = (path: string) => path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], values) as string

  // warn before leaving with unsaved edits
  useEffect(() => {
    if (!formState.isDirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [formState.isDirty])

  const onSave = handleSubmit((v) =>
    startTransition(async () => {
      const res = await updateResume(id, {
        title: v.title,
        targetRole: v.targetRole,
        template: v.template,
        data: fromEditor(v),
      })
      if (!res.ok) return void toast.error(res.error)
      reset(v)
      toast.success("Saved")
      router.refresh()
    }),
  )

  return (
    <form onSubmit={onSave} className="flex flex-1 flex-col">
      <div className="sticky top-16 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-4 py-3">
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft /> Dashboard
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">{formState.isDirty ? "Unsaved changes" : "All changes saved"}</span>
          <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
            <Select value={values.template} onValueChange={(t) => setValue("template", t as TemplateId, { shouldDirty: true })}>
              <SelectTrigger size="sm" className="min-w-0 flex-1 sm:w-36 sm:flex-none" aria-label="Template">
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
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href={`/resume/${id}`}>
                <Eye /> <span className="hidden sm:inline">Preview & export</span>
                <span className="sm:hidden">Preview</span>
              </Link>
            </Button>
            <Button type="submit" size="sm" disabled={saving || !formState.isDirty}>
              {saving ? <Spinner /> : <Save />} Save
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,560px)_1fr]">
        <Tabs defaultValue="basics" className="min-w-0">
          <TabsList className="w-full flex-wrap">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-6 pt-4">
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField register={register} name="title" label="Resume title (only you see this)" />
                <TextField register={register} name="targetRole" label="Target role" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField register={register} name="personalInfo.name" label="Full name" />
                <TextField register={register} name="personalInfo.role" label="Headline" placeholder="Senior Frontend Engineer" />
                <TextField register={register} name="personalInfo.email" label="Email" type="email" />
                <TextField register={register} name="personalInfo.phone" label="Phone" />
                <TextField register={register} name="personalInfo.location" label="Location" />
                <TextField register={register} name="personalInfo.website" label="Website" />
                <TextField register={register} name="personalInfo.linkedin" label="LinkedIn" />
                <TextField register={register} name="personalInfo.github" label="GitHub" />
              </div>
              <Field>
                <FieldLabel htmlFor="summary">Professional summary</FieldLabel>
                <Textarea id="summary" rows={4} {...register("personalInfo.summary")} />
              </Field>
            </FieldGroup>
          </TabsContent>

          <TabsContent value="experience" className="pt-4">
            <ListSection
              control={control}
              name="experience"
              empty={EMPTY.experience}
              addLabel="Add experience"
              itemTitle={(i) => watch(`experience.${i}.role`) || watch(`experience.${i}.company`) || "New role"}
              render={(i) => (
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField register={register} name={`experience.${i}.role`} label="Role" />
                    <TextField register={register} name={`experience.${i}.company`} label="Company" />
                    <TextField register={register} name={`experience.${i}.location`} label="Location" />
                    <TextField register={register} name={`experience.${i}.date`} label="Dates" placeholder="2022 – Present" />
                  </div>
                  <Field>
                    <FieldLabel htmlFor={`exp-${i}`}>Achievements</FieldLabel>
                    <Textarea id={`exp-${i}`} rows={5} {...register(`experience.${i}.achievements`)} />
                    <FieldDescription>One bullet per line. Start with a verb and quantify impact.</FieldDescription>
                  </Field>
                </FieldGroup>
              )}
            />
          </TabsContent>

          <TabsContent value="projects" className="pt-4">
            <ListSection
              control={control}
              name="projects"
              empty={EMPTY.project}
              addLabel="Add project"
              itemTitle={(i) => watch(`projects.${i}.name`) || "New project"}
              render={(i) => (
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField register={register} name={`projects.${i}.name`} label="Name" />
                    <TextField register={register} name={`projects.${i}.url`} label="Link" />
                  </div>
                  <Field>
                    <FieldLabel htmlFor={`proj-${i}`}>Description</FieldLabel>
                    <Textarea id={`proj-${i}`} rows={3} {...register(`projects.${i}.description`)} />
                  </Field>
                  <TextField register={register} name={`projects.${i}.technologies`} label="Technologies (comma separated)" />
                </FieldGroup>
              )}
            />
          </TabsContent>

          <TabsContent value="education" className="space-y-6 pt-4">
            <ListSection
              control={control}
              name="education"
              empty={EMPTY.education}
              addLabel="Add education"
              itemTitle={(i) => watch(`education.${i}.school`) || "New education"}
              render={(i) => (
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField register={register} name={`education.${i}.degree`} label="Degree" />
                  <TextField register={register} name={`education.${i}.school`} label="School" />
                  <TextField register={register} name={`education.${i}.location`} label="Location" />
                  <TextField register={register} name={`education.${i}.date`} label="Dates" />
                </div>
              )}
            />
            <h3 className="pt-2 text-sm font-medium">Certifications</h3>
            <ListSection
              control={control}
              name="certifications"
              empty={EMPTY.certification}
              addLabel="Add certification"
              itemTitle={(i) => watch(`certifications.${i}.name`) || "New certification"}
              render={(i) => (
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField register={register} name={`certifications.${i}.name`} label="Name" />
                  <TextField register={register} name={`certifications.${i}.issuer`} label="Issuer" />
                  <TextField register={register} name={`certifications.${i}.date`} label="Date" />
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="skills" className="pt-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="tech">Technical skills</FieldLabel>
                <Textarea id="tech" rows={4} {...register("skillsTechnical")} />
                <FieldDescription>Comma separated, most relevant first.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="soft">Soft skills</FieldLabel>
                <Textarea id="soft" rows={3} {...register("skillsSoft")} />
              </Field>
            </FieldGroup>
          </TabsContent>
        </Tabs>

        <div className="hidden min-w-0 lg:block">
          <div className="sticky top-36 max-h-[calc(100dvh-10rem)] overflow-auto rounded-lg border bg-muted/40 p-4">
            <div className="mx-auto max-w-[816px] overflow-hidden rounded-sm shadow-md">
              <ScaledPreview>
                <ResumeRenderer template={preview.template} data={fromEditor(preview)} />
              </ScaledPreview>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
