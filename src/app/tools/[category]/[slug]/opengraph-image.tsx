import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";
import { getTool } from "@/lib/tools/registry";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: { category: string; slug: string } }) {
  const tool = getTool(params.category, params.slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf9f5",
          color: "#141413",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#cc785c", fontSize: 28, fontWeight: 600 }}>
          {SITE.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>{tool?.name ?? "Browser tool"}</div>
          <div style={{ fontSize: 28, color: "#6c6a64", maxWidth: 900 }}>
            {tool?.shortDescription ?? "Privacy-first tools that run locally in your browser."}
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#cc785c" }}>{SITE.privacyNote}</div>
      </div>
    ),
    { ...size },
  );
}
