import { cn } from "@/lib/utils"

export function PageHeader({
  eyebrow,
  title,
  lede,
  className,
  children,
}: {
  eyebrow?: string
  title: React.ReactNode
  lede?: React.ReactNode
  className?: string
  children?: React.ReactNode
}) {
  return (
    <header className={cn("border-b", className)}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 pt-14 pb-10">
        <div className="max-w-3xl">
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h1 className="display text-5xl sm:text-6xl">{title}</h1>
          {lede && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{lede}</p>}
        </div>
        {children}
      </div>
    </header>
  )
}
