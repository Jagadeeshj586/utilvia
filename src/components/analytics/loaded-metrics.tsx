"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";

export function LoadedMetrics({ gaId }: { gaId?: string }) {
  return (
    <>
      <Analytics />
      <SpeedInsights />
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </>
  );
}
