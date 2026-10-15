import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between border-r bg-card p-10 lg:flex">
        <Logo />
        <figure className="max-w-md">
          <blockquote className="display text-4xl leading-tight">
            “The mock interviewer asked about the exact project on my resume — and it was the first question in the real
            interview too.”
          </blockquote>
          <figcaption className="eyebrow mt-6">Example review · demo data</figcaption>
        </figure>
        <p className="eyebrow">Resume builder · Interview coach</p>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-between px-6 lg:justify-end">
          <Logo className="lg:hidden" />
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </div>
  )
}
