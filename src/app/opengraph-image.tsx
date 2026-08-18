import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#faf9f5",
          color: "#141413",
          padding: "80px",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#cc785c", marginBottom: 16, fontFamily: "sans-serif", fontWeight: 600 }}>
          {SITE.name}
        </div>
        <div style={{ fontSize: 64, fontWeight: 500, lineHeight: 1.08, maxWidth: 920 }}>
          The tools you need. All in one place.
        </div>
        <div style={{ marginTop: 24, fontSize: 26, color: "#6c6a64", fontFamily: "sans-serif" }}>
          {SITE.privacyNote}
        </div>
      </div>
    ),
    { ...size },
  );
}
