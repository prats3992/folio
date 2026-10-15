import type { Metadata } from "next"
import { FAQ } from "@/components/marketing/pricing/faq"
import { PricingCards } from "@/components/marketing/pricing/pricing-cards"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = { title: "Pricing" }

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title={
          <>
            Every feature, <em className="text-primary">every plan</em>.
          </>
        }
        lede="Plans only change how many AI requests you get each day. There's no billing — this is a student project, and plans can be switched freely from your dashboard."
      />
      <div className="mx-auto max-w-7xl space-y-24 px-4 py-16">
        <PricingCards />
        <FAQ />
      </div>
    </>
  )
}
