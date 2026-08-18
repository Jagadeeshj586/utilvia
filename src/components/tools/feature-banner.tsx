import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FeatureBanner({
  eyebrow,
  title,
  body,
  href,
  cta,
  icon: Icon,
  tone = "cream",
  className,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  icon?: LucideIcon;
  tone?: "cream" | "dark" | "coral";
  className?: string;
}) {
  const tones = {
    cream: "bg-surface-card text-ink",
    dark: "bg-[var(--surface-dark)] text-[var(--on-dark)]",
    coral: "bg-[var(--coral)] text-[var(--on-primary)]",
  };
  const bodyTone = {
    cream: "text-[var(--body)]",
    dark: "text-[var(--on-dark-soft)]",
    coral: "text-white/85",
  };
  const eyebrowTone = {
    cream: "text-[var(--muted-ink)]",
    dark: "text-[var(--accent-teal)]",
    coral: "text-white/80",
  };

  return (
    <div className={cn("flex flex-col gap-5 rounded-lg px-6 py-6 transition-all duration-300 ease-out sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-7", tones[tone], className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className={cn("mb-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[1.5px]", eyebrowTone[tone])}>
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
            {eyebrow}
          </p>
        ) : null}
        <h2 className={cn("font-display text-[28px] leading-tight tracking-[-0.3px]", tone === "cream" ? "text-ink" : "")}>
          {title}
        </h2>
        <p className={cn("mt-3 text-sm leading-[1.65] sm:text-base", bodyTone[tone])}>{body}</p>
      </div>
      <Button asChild variant={tone === "cream" ? "default" : "cream"} className="shrink-0">
        <Link href={href}>
          {cta}
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
