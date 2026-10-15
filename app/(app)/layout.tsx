import { SiteHeader } from "@/components/site-header"
import { requireUser } from "@/lib/session"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader user={{ name: user.name, email: user.email }} />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}
