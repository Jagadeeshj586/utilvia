"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useState } from "react";

export function DeferredMetrics({ gaId }: { gaId?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const enable = () => setReady(true);
    const idle = window.requestIdleCallback?.(enable, { timeout: 4000 });
    const fallback = window.setTimeout(enable, 2500);
    return () => {
      if (idle != null) window.cancelIdleCallback?.(idle);
      window.clearTimeout(fallback);
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </>
  );
}
