"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, LogOut, Menu, MessagesSquare } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { signOut, useSession } from "@/lib/auth-client"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"

const PUBLIC_LINKS = [
  { title: "Templates", href: "/templates" },
  { title: "Features", href: "/features" },
  { title: "Pricing", href: "/pricing" },
  { title: "Reviews", href: "/blog" },
]

const APP_LINKS = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Interview", href: "/interview" },
]

type HeaderUser = { name: string; email: string }

export function SiteHeader({ className, user: serverUser }: { className?: string; user?: HeaderUser | null }) {
  const { data: session, isPending: sessionPending } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  // the server knows the user in the app area; avoid the nav flashing while the client session loads
  const isPending = serverUser !== undefined ? false : sessionPending
  const user = sessionPending && serverUser !== undefined ? serverUser : (session?.user ?? null)
  const links = user ? [...APP_LINKS, ...PUBLIC_LINKS] : PUBLIC_LINKS

  async function logout() {
    await signOut()
    setOpen(false)
    router.push("/")
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className={cn("sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md no-print", className)}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "relative px-3 py-2 text-sm transition-colors hover:text-foreground",
                isActive(l.href)
                  ? "text-foreground after:absolute after:inset-x-3 after:-bottom-[13px] after:h-px after:bg-foreground"
                  : "text-muted-foreground",
              )}
            >
              {l.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isPending && !user && (
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Log in</Link>
            </Button>
          )}
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/resume/new">Create resume</Link>
          </Button>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                  <Avatar className="size-8">
                    <AvatarFallback className="display bg-accent text-base text-accent-foreground">
                      {user.name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                  {user.name}
                  <div className="truncate text-xs font-normal text-muted-foreground">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/interview">
                    <MessagesSquare /> Interview prep
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout}>
                  <LogOut /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-2 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {l.title}
                  </Link>
                ))}
                <Button asChild className="mt-4">
                  <Link href="/resume/new" onClick={() => setOpen(false)}>
                    Create resume
                  </Link>
                </Button>
                {user ? (
                  <Button variant="outline" onClick={logout}>
                    Log out
                  </Button>
                ) : (
                  <Button variant="outline" asChild>
                    <Link href="/login" onClick={() => setOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
