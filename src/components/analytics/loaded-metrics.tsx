"use client";

import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";

export function LoadedMetrics({ gaId }: { gaId?: string }) {
  return (
    <>
      <Analytics />
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </>
  );
}
