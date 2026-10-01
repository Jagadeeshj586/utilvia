"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShaderBackground } from "@/components/ui/mesh-portfolio";
import { cn } from "@/lib/utils";

interface HeroProps {
  eyebrow?: string;
  eyebrowHref?: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  decoration?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Hero({
  eyebrow,
  eyebrowHref = "#",
  title,
  subtitle,
  ctaLabel = "Explore Now",
  ctaHref = "#",
  secondaryCtaLabel,
  secondaryCtaHref,
  decoration,
  children,
  className,
}: HeroProps) {
  return (
    <section
      id="hero"
      className={cn(
        "hero-shell relative isolate mx-auto flex w-full min-h-[70svh] flex-col justify-center overflow-hidden bg-canvas px-4 py-12 pb-28 text-center sm:px-6 sm:py-14 sm:pb-36",
        className,
      )}
    >
      {/* Utilvia cream/coral/amber mesh shader */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <ShaderBackground className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-canvas/65" />
      </div>

      {decoration}

      <div className="relative z-20 mx-auto w-full max-w-[1200px]">
        {eyebrow ? (
          <Link href={eyebrowHref} className="group inline-flex">
            <span className="mx-auto flex w-fit items-center justify-center rounded-full border border-[var(--hairline)] bg-surface-soft px-5 py-2 text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--muted-ink)]">
              {eyebrow}
              <ChevronRight className="ml-2 inline h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>
        ) : null}

        <h1 className="mx-auto max-w-4xl animate-fade-in font-display text-[32px] font-semibold leading-[1.05] tracking-[-1.5px] text-ink opacity-0 motion-reduce:translate-y-0 motion-reduce:animate-none motion-reduce:opacity-100 sm:text-[48px] lg:text-[56px]">
          {title}
        </h1>

        <p className="mx-auto mt-4 max-w-3xl animate-fade-in text-[16px] font-normal leading-[1.65] text-[var(--body)] opacity-0 [animation-delay:80ms] motion-reduce:translate-y-0 motion-reduce:animate-none motion-reduce:opacity-100">
          {subtitle}
        </p>

        {(ctaLabel || secondaryCtaLabel) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 animate-fade-in opacity-0 [animation-delay:140ms] motion-reduce:translate-y-0 motion-reduce:animate-none motion-reduce:opacity-100">
            {ctaLabel ? (
              <Button asChild className="h-10 rounded-md px-5 text-[14px] font-medium">
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight />
                </Link>
              </Button>
            ) : null}
            {secondaryCtaLabel && secondaryCtaHref ? (
              <Button asChild variant="outline" className="h-10 rounded-md px-5 text-[14px] font-medium">
                <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
              </Button>
            ) : null}
          </div>
        )}

        {children ? <div className="mt-6 space-y-0">{children}</div> : null}
      </div>
    </section>
  );
}
