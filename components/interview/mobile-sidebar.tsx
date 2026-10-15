"use client"

import { useState } from "react"
import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ChatSidebar, type SidebarChat } from "./chat-sidebar"

export function MobileSidebar({ chats }: { chats: SidebarChat[] }) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <PanelLeft /> Menu
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">Interview prep navigation</SheetTitle>
        <ChatSidebar chats={chats} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
