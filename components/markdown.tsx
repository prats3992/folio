import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"
import "highlight.js/styles/github-dark.css"

/**
 * Renders model output. react-markdown ignores raw HTML and strips dangerous URL schemes (javascript:)
 * by default, so model output can't inject script.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert prose-pre:bg-zinc-900 prose-pre:p-0", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        // no remote images: an injected prompt could otherwise smuggle data out via an image URL
        disallowedElements={["img"]}
        unwrapDisallowed
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer noopener">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
