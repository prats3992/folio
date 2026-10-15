"use client"

import { createContext, useContext } from "react"

// Thumbnails render templates inside other links/buttons, where nested <a> is invalid HTML.
const StaticLinksContext = createContext(false)

export function StaticLinks({ children }: { children: React.ReactNode }) {
  return <StaticLinksContext.Provider value>{children}</StaticLinksContext.Provider>
}

/** <a> in interactive previews; <span> inside thumbnails. */
export function A({ href, children, ...props }: React.ComponentProps<"a">) {
  const isStatic = useContext(StaticLinksContext)
  if (isStatic || !href) return <span className={props.className}>{children}</span>
  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}
