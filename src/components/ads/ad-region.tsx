import { GoogleAd } from "@/components/ads/google-ad";
import { ADSENSE, type AdSenseSlot } from "@/lib/adsense";
import { cn } from "@/lib/utils";

export function AdRegion({
  name,
  className,
  minHeight = 100,
}: {
  name: AdSenseSlot;
  className?: string;
  minHeight?: number;
}) {
  const slot = ADSENSE.slots[name];
  if (!slot) return null;

  return (
    <div className={cn("my-8 w-full overflow-x-hidden", className)}>
      <GoogleAd slot={slot} minHeight={minHeight} />
    </div>
  );
}
