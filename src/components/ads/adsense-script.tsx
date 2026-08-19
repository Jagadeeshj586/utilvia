import Script from "next/script";
import { ADSENSE } from "@/lib/adsense";

export function AdSenseScript() {
  if (!ADSENSE.publisherId) return null;

  return (
    <Script
      id="utilvia-adsense"
      async
      src={ADSENSE.scriptSrc}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
