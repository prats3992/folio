export function ToolHeader({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <div className="mb-8 border-b pb-6">
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h1 className="display text-4xl sm:text-5xl">{title}</h1>
      {lede && <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{lede}</p>}
    </div>
  )
}
