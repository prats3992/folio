import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PLANS } from "@/lib/plans"
import { cn } from "@/lib/utils"

export function PricingCards() {
  return (
    <div className="grid border-y md:grid-cols-3">
      {PLANS.map((plan, i) => (
        <div
          key={plan.id}
          className={cn("flex flex-col py-10 md:px-8", i > 0 && "border-t md:border-t-0 md:border-l", plan.highlighted && "bg-card")}
        >
          <div className="flex items-baseline justify-between">
            <h3 className="display text-4xl">{plan.name}</h3>
            {plan.highlighted && <span className="eyebrow text-primary">Most chosen</span>}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>
          <p className="mt-8 flex items-baseline gap-1">
            <span className="display text-6xl">${plan.price}</span>
            <span className="text-sm text-muted-foreground">/ month</span>
          </p>
          <p className="eyebrow mt-2">{plan.dailyAiLimit} AI requests a day</p>
          <ul className="mt-8 flex-1 space-y-3 text-sm">
            {plan.features.map((f) => (
              <li key={f} className="flex gap-3 border-t pt-3">
                {f}
              </li>
            ))}
          </ul>
          <Button className="mt-10 h-10" variant={plan.highlighted ? "default" : "outline"} asChild>
            <Link href={`/signup?plan=${plan.id}`}>Start with {plan.name}</Link>
          </Button>
        </div>
      ))}
    </div>
  )
}
