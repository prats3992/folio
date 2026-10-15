import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1f5f59" }}>
        <svg width="120" height="120" viewBox="0 0 32 32">
          <path d="M8.5 5h11L25 10.5V27H8.5z" fill="#f8f6f1" />
          <path d="M19.5 5v5.5H25" fill="#d9d2c3" />
          <path d="M12 15.5h9.5M12 19.5h9.5M12 23.5h5.5" stroke="#1f5f59" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size,
  )
}
