import { ChatSidebar } from "@/components/interview/chat-sidebar"
import { MobileSidebar } from "@/components/interview/mobile-sidebar"
import { listChats } from "@/lib/chat/store"
import { requireUser } from "@/lib/session"

export default async function InterviewLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  const chats = await listChats(user.id)
  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-0">
      <aside className="hidden w-72 shrink-0 border-r bg-sidebar md:block">
        <ChatSidebar chats={chats} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b px-4 py-2 md:hidden">
          <MobileSidebar chats={chats} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
