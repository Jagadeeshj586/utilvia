"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LoadedMetrics = dynamic(() => import("./loaded-metrics").then((module) => module.LoadedMetrics), {
  ssr: false,
});

export function DeferredMetrics({ gaId }: { gaId?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const enable = () => setReady(true);
    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "scroll", "touchstart"];
    for (const event of events) {
      window.addEventListener(event, enable, { once: true, passive: true });
    }
    const timer = window.setTimeout(enable, 12_000);
    return () => {
      for (const event of events) {
        window.removeEventListener(event, enable);
      }
      window.clearTimeout(timer);
    };
  }, []);

  if (!ready) return null;
  return <LoadedMetrics gaId={gaId} />;
}
