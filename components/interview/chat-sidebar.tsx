"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { deleteChat, renameChat } from "@/lib/actions/chat"
import { cn } from "@/lib/utils"

export type SidebarChat = { id: string; title: string; kind: string }

const TOOLS = [
  { href: "/interview", label: "Overview", exact: true },
  { href: "/interview/new?kind=mock_interview", label: "Mock interview", match: "__never__" },
  { href: "/interview/review", label: "Resume review" },
  { href: "/interview/job-match", label: "Job match" },
  { href: "/interview/star", label: "STAR questions" },
  { href: "/interview/dsa", label: "DSA practice" },
]

const KIND_LABEL: Record<string, string> = { general: "Coaching", mock_interview: "Mock interview", resume_review: "Review" }

function ChatItem({ chat, active, onNavigate }: { chat: SidebarChat; active: boolean; onNavigate?: () => void }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(chat.title)
  const [, startTransition] = useTransition()

  function save() {
    setEditing(false)
    const next = title.trim()
    if (!next || next === chat.title) return setTitle(chat.title)
    startTransition(async () => {
      const res = await renameChat(chat.id, next)
      if (!res.ok) {
        setTitle(chat.title)
        toast.error(res.error)
      }
    })
  }

  function remove() {
    startTransition(async () => {
      const res = await deleteChat(chat.id)
      if (!res.ok) return void toast.error(res.error)
      if (active) router.push("/interview")
    })
  }

  if (editing) {
    return (
      <Input
        autoFocus
        value={title}
        maxLength={80}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save()
          if (e.key === "Escape") {
            setTitle(chat.title)
            setEditing(false)
          }
        }}
        className="h-8"
      />
    )
  }

  return (
    <div
      className={cn(
        "group flex items-center rounded-sm text-sm hover:bg-muted",
        active && "bg-muted font-medium text-foreground",
      )}
    >
      <Link href={`/interview/${chat.id}`} onClick={onNavigate} className="min-w-0 flex-1 px-2 py-2">
        <span className="block truncate">{title}</span>
        <span className="eyebrow block text-[0.625rem]">{KIND_LABEL[chat.kind] ?? chat.kind}</span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="mr-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
            aria-label="Chat options"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => setEditing(true)}>
            <Pencil /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={remove}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function ChatSidebar({ chats, onNavigate }: { chats: SidebarChat[]; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <Button asChild className="w-full">
        <Link href="/interview/new" onClick={onNavigate}>
          <Plus /> New chat
        </Link>
      </Button>
      <p className="eyebrow px-2 pt-1">Tools</p>
      <nav className="space-y-0.5">
        {TOOLS.map((t) => {
          const base = t.href.split("?")[0]
          const active = t.match === "__never__" ? false : t.exact ? pathname === base : pathname.startsWith(base)
          return (
            <Link
              key={t.href}
              href={t.href}
              onClick={onNavigate}
              className={cn(
                "block rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                active && "bg-muted font-medium text-foreground",
              )}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>
      <Separator />
      <p className="eyebrow px-2">Conversations</p>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-0.5 pr-2">
          {chats.length === 0 && <p className="px-2 text-sm text-muted-foreground">No conversations yet.</p>}
          {chats.map((c) => (
            <ChatItem key={c.id} chat={c} active={pathname === `/interview/${c.id}`} onNavigate={onNavigate} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
