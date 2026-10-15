import Link from "next/link"
import { Logo } from "@/components/logo"
import { SITE } from "@/lib/site"

const COLUMNS = [
  {
    title: "Build",
    links: [
      { href: "/resume/new", label: "New resume" },
      { href: "/templates", label: "Templates" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Practise",
    links: [
      { href: "/interview/new?kind=mock_interview", label: "Mock interview" },
      { href: "/interview/job-match", label: "Job match" },
      { href: "/interview/star", label: "STAR questions" },
      { href: "/interview/dsa", label: "DSA practice" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/features", label: "How it works" },
      { href: "/blog", label: "Reviews" },
      { href: "/feedback", label: "Send feedback" },
      { href: SITE.github, label: "GitHub", external: true },
    ],
  },
]

export function Footer() {
  return (
    <footer className="no-print border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            A resume builder and interview coach in one place — so the story you write is the one you practise.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="eyebrow mb-4">{col.title}</p>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  {"external" in l ? (
                    <a href={l.href} target="_blank" rel="noreferrer" className="text-foreground/80 hover:text-foreground">
                      {l.label} ↗
                    </a>
                  ) : (
                    <Link href={l.href} className="text-foreground/80 hover:text-foreground">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="eyebrow mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-5">
          <span>
            © {new Date().getFullYear()} {SITE.name}
          </span>
          <span>Built as a university project · AI by open models on OpenRouter</span>
        </div>
      </div>
    </footer>
  )
}
