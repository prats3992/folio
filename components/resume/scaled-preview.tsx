"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { StaticLinks } from "@/components/resume-templates/link"
import { cn } from "@/lib/utils"

const SHEET_WIDTH = 816 // A4 at 96dpi

/**
 * Renders an 816px-wide resume sheet scaled to fit its container's width.
 * - `ratio` (height / width): crop to a fixed aspect, e.g. for thumbnails.
 * - no `ratio`: show the whole sheet, with the container height following the scaled content.
 * `interactive` keeps links clickable (full previews); thumbnails are inert.
 */
export function ScaledPreview({
  children,
  ratio,
  interactive = false,
  className,
}: {
  children: React.ReactNode
  ratio?: number
  interactive?: boolean
  className?: string
}) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState<number | null>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useLayoutEffect(() => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return
    const measure = () => {
      setScale(Math.min(1, o.clientWidth / SHEET_WIDTH))
      setContentHeight(i.scrollHeight)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(o)
    ro.observe(i)
    return () => ro.disconnect()
  }, [])

  const s = scale ?? 0
  return (
    <div
      ref={outer}
      className={cn(
        "scaled-preview relative w-full overflow-hidden bg-white",
        ratio && "rounded-md border",
        // thumbnails stay hidden until measured; full sheets show at natural size meanwhile
        !scale && ratio && "invisible",
        className,
      )}
      style={ratio ? { aspectRatio: `1 / ${ratio}` } : { height: scale ? contentHeight * s : undefined }}
      aria-hidden={interactive ? undefined : true}
    >
      <div
        ref={inner}
        inert={!interactive}
        className={cn(
          "top-0 left-0 origin-top-left",
          scale || ratio ? "absolute" : "relative",
          !interactive && "pointer-events-none select-none",
        )}
        style={{ width: SHEET_WIDTH, transform: scale ? `scale(${s})` : undefined }}
      >
        {interactive ? children : <StaticLinks>{children}</StaticLinks>}
      </div>
    </div>
  )
}
