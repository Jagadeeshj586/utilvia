"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function GradientBackground({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const section = root.closest("section");
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    const disableParallax = () => {
      root.style.setProperty("--hero-parallax-x", "0px");
      root.style.setProperty("--hero-parallax-y", "0px");
    };

    if (reducedMotion.matches || coarsePointer.matches) {
      disableParallax();
      return;
    }

    let frame = 0;
    const onMove = (event: MouseEvent) => {
      if (frame) return;
      const { clientX, clientY } = event;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = section.getBoundingClientRect();
        const nx = (clientX - rect.left) / rect.width - 0.5;
        const ny = (clientY - rect.top) / rect.height - 0.5;
        root.style.setProperty("--hero-parallax-x", `${(nx * 18).toFixed(2)}px`);
        root.style.setProperty("--hero-parallax-y", `${(ny * 14).toFixed(2)}px`);
      });
    };

    const onLeave = () => disableParallax();

    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);

    const onReducedChange = () => {
      if (reducedMotion.matches) disableParallax();
    };

    reducedMotion.addEventListener("change", onReducedChange);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
      reducedMotion.removeEventListener("change", onReducedChange);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("hero-atmosphere", className)} aria-hidden>
      <div className="hero-parallax-layer">
        <div className="gradient-blob gradient-coral" />
        <div className="gradient-blob gradient-amber" />
        <div className="gradient-blob gradient-teal" />
        <div className="gradient-blob gradient-deep-coral" />
        <div className="gradient-blob gradient-warm" />
        <div className="gradient-blob gradient-bloom" />
        <div className="hero-light-band hero-light-band-a" />
        <div className="hero-light-band hero-light-band-b" />
        <div className="hero-light-band hero-light-band-c" />
        <div className="hero-light-sheen" />
      </div>
      <div className="hero-vignette" />
    </div>
  );
}
