"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { setPlan } from "@/lib/actions/account"
import { PLANS } from "@/lib/plans"

export function PlanSwitcher({ plan }: { plan: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <Select
      value={plan}
      disabled={pending}
      onValueChange={(v) =>
        startTransition(async () => {
          const res = await setPlan(v)
          if (!res.ok) toast.error(res.error)
          else {
            toast.success("Plan updated (demo — no billing)")
            router.refresh()
          }
        })
      }
    >
      <SelectTrigger className="w-40" aria-label="Plan">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PLANS.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name} · {p.dailyAiLimit}/day
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
