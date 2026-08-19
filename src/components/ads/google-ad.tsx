"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ADSENSE } from "@/lib/adsense";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type GoogleAdProps = {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  minHeight?: number;
};

function GoogleAdUnit({ slot, format = "auto", className, minHeight = 100 }: GoogleAdProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!slot || pushed.current) return;
    const node = insRef.current;
    if (!node) return;
    if (node.getAttribute("data-adsbygoogle-status")) return;
    if (node.getAttribute("data-ad-status")) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushed.current = true;
    } catch {
      /* Ad blockers and script failures must not break tools. */
    }
  }, [slot]);

  return (
    <aside
      className={cn("w-full max-w-full overflow-x-hidden", className)}
      aria-label="Advertisement"
    >
      <div className="mx-auto w-full max-w-[100vw]" style={{ minHeight }}>
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={ADSENSE.publisherId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}

export function GoogleAd(props: GoogleAdProps) {
  const pathname = usePathname();
  if (!props.slot) return null;
  return <GoogleAdUnit key={`${pathname}:${props.slot}`} {...props} />;
}
