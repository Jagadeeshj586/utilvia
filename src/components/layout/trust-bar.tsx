import { Lock, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    icon: Zap,
    title: "Lightning fast",
    body: "Optimized in-browser pipelines — no waiting on servers.",
  },
  {
    icon: Lock,
    title: "Privacy first",
    body: "Files are processed locally whenever possible. Nothing is stored.",
  },
  {
    icon: Sparkles,
    title: "Free forever",
    body: "No subscriptions, no watermarks, no sign-up.",
  },
] as const;

export function TrustBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid divide-y divide-[var(--hairline)] overflow-hidden rounded-xl border border-[var(--hairline)] md:grid-cols-3 md:divide-x md:divide-y-0",
        className,
      )}
    >
      {ITEMS.map((item) => (
        <div key={item.title} className="flex items-start gap-3 px-5 py-6 md:px-6 md:py-7">
          <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
          <div>
            <p className="text-[15px] font-semibold leading-snug text-ink">{item.title}</p>
            <p className="mt-1 text-[14px] leading-[1.5] text-[var(--body)]">{item.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
