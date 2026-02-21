import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "radial-gradient(circle at top, #ffffff 0%, #fefefe 30%, #f7f4ef 100%)",
          padding: 72,
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontFamily: "system-ui, -apple-system, Segoe UI, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 18, letterSpacing: 4, textTransform: "uppercase", color: "#425C59" }}>
            Be Inspired By Us
          </div>
          <div style={{ fontSize: 66, fontWeight: 800, color: "#620E06", lineHeight: 1.05 }}>
            Arno Ockerman
          </div>
          <div style={{ fontSize: 28, color: "rgba(0,0,0,0.7)", maxWidth: 720 }}>
            Coaching • Voeding • Mindset — duidelijke stappen voor ambitieuze mannen.
          </div>
        </div>
        <div
          style={{
            fontSize: 18,
            color: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(98,14,6,0.15)",
            padding: "14px 18px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.8)",
          }}
        >
          beinspiredbyus.be
        </div>
      </div>
    ),
    size,
  );
}

