import { ImageResponse } from "next/og"
import { SITE } from "@/lib/site"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = `${SITE.name} — resume builder and interview coach`

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#f8f6f1", color: "#22201c", fontFamily: "Georgia, serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 40 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <path d="M7 3.5h12.5L26 10v18.5H7z" fill="#ffffff" stroke="#22201c" strokeWidth="1.6" />
            <path d="M19.5 3.5V10H26" fill="none" stroke="#22201c" strokeWidth="1.6" />
            <path d="M11 15h11M11 19.5h11M11 24h6.5" stroke="#1f5f59" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {SITE.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 92, lineHeight: 1.02, letterSpacing: -2 }}>
          <span>Write the story.</span>
          <span style={{ color: "#1f5f59", fontStyle: "italic" }}>Rehearse the interview.</span>
        </div>
        <div style={{ fontSize: 24, color: "#6f695e", fontFamily: "monospace", letterSpacing: 3, textTransform: "uppercase" }}>
          Resume builder · Interview coach
        </div>
      </div>
    ),
    size,
  )
}
