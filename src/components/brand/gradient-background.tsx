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
    const finePointer = window.matchMedia("(pointer: fine)");

    const setVar = (name: string, value: string) => {
      root.style.setProperty(name, value);
    };

    const resetPointer = () => {
      setVar("--hero-mx", "0");
      setVar("--hero-my", "0");
    };

    if (reducedMotion.matches) {
      resetPointer();
      setVar("--hero-scroll", "0");
      return;
    }

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let tickingPointer = false;

    const onMove = (event: PointerEvent) => {
      if (!finePointer.matches || window.matchMedia("(max-width: 1023px)").matches) return;
      const rect = section.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width - 0.5;
      pointerY = (event.clientY - rect.top) / rect.height - 0.5;
      if (tickingPointer) return;
      tickingPointer = true;
      frame = window.requestAnimationFrame(() => {
        tickingPointer = false;
        setVar("--hero-mx", pointerX.toFixed(3));
        setVar("--hero-my", pointerY.toFixed(3));
      });
    };

    const onLeave = () => resetPointer();

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
      setVar("--hero-scroll", progress.toFixed(3));
    };

    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("hero-atmosphere", className)} aria-hidden>
      <div className="hero-wash" />
      <div className="hero-depth hero-depth-far">
        <span className="hero-orb hero-orb-a" />
        <span className="hero-orb hero-orb-b" />
        <span className="hero-veil hero-veil-a" />
      </div>
      <div className="hero-depth hero-depth-mid">
        <span className="hero-orb hero-orb-c" />
        <span className="hero-orb hero-orb-d" />
        <span className="hero-ribbon hero-ribbon-a" />
      </div>
      <div className="hero-depth hero-depth-near">
        <span className="hero-orb hero-orb-e" />
        <span className="hero-ribbon hero-ribbon-b" />
        <span className="hero-sheen" />
      </div>
      <div className="hero-vignette" />
      <div className="hero-fade" />
    </div>
  );
}
