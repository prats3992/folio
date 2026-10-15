import type { Metadata } from "next"
import Link from "next/link"
import { FeedbackForm } from "@/components/feedback/feedback-form"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/session"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = { title: "Share feedback" }

export default async function FeedbackPage() {
  const session = await getSession()

  return (
    <>
    <PageHeader
      eyebrow="Feedback"
      title="Tell us how it went."
      lede="What worked, what didn't, what you wish it did. Your note appears on the reviews page."
    />
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-sm border bg-card p-6 sm:p-8">
        {session ? (
          <FeedbackForm defaultName={session.user.name} />
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground">Please log in to leave feedback — it keeps the reviews page spam-free.</p>
            <Button asChild>
              <Link href="/login?next=/feedback">Log in</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
