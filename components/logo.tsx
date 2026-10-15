import Link from "next/link"
import { SITE } from "@/lib/site"
import { cn } from "@/lib/utils"

/** Page with a folded corner and two ruled lines — a resume sheet. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden="true">
      <path d="M7 3.5h12.5L26 10v18.5H7z" fill="var(--card)" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M19.5 3.5V10H26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M11 15h11M11 19.5h11M11 24h6.5" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2 text-foreground", className)} aria-label={`${SITE.name} home`}>
      <LogoMark className="transition-transform group-hover:-rotate-6" />
      <span className="display text-[1.6rem] leading-none">{SITE.name}</span>
    </Link>
  )
}
