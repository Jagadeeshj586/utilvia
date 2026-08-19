"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { LAND_DOTS, OCEAN_DOTS } from "@/components/brand/globe-dots";

const ROTATE_SPEED = 0.16;
const TILT = 0.42;
const START_ANGLE = -1.22;

function palette(dark: boolean) {
  return dark
    ? {
        oceanBack: "rgba(250, 249, 245, 0.06)",
        oceanFront: "rgba(204, 120, 92, 0.22)",
        landBack: "rgba(204, 120, 92, 0.14)",
        landFront: "rgba(232, 165, 90, 0.82)",
        landCore: "rgba(250, 249, 245, 0.88)",
      }
    : {
        oceanBack: "rgba(61, 61, 58, 0.08)",
        oceanFront: "rgba(204, 120, 92, 0.2)",
        landBack: "rgba(204, 120, 92, 0.16)",
        landFront: "rgba(169, 88, 62, 0.72)",
        landCore: "rgba(204, 120, 92, 0.9)",
      };
}

export function HeroGlobe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 767px)");
    let frame = 0;
    let angle = START_ANGLE;
    let last = performance.now();
    let intersecting = true;
    let running = true;

    const shouldAnimate = () =>
      intersecting && document.visibilityState === "visible" && !reducedMotion.matches;

    const syncSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const drawDots = (
      dots: Float32Array,
      colors: ReturnType<typeof palette>,
      land: boolean,
      front: boolean,
      radius: number,
      cx: number,
      cy: number,
      cosY: number,
      sinY: number,
      cosX: number,
      sinX: number,
      step: number,
    ) => {
      const minSize = land ? radius * 0.003 : radius * 0.0016;
      const maxSize = land ? radius * 0.0068 : radius * 0.003;

      for (let i = 0; i < dots.length; i += 3 * step) {
        const x0 = dots[i];
        const y0 = dots[i + 1];
        const z0 = dots[i + 2];
        const y1 = y0 * cosX - z0 * sinX;
        const z1 = y0 * sinX + z0 * cosX;
        const x = x0 * cosY + z1 * sinY;
        const y = y1;
        const z = -x0 * sinY + z1 * cosY;
        if (front ? z < 0.02 : z >= 0.02) continue;

        const depth = (z + 1) * 0.5;
        const size = minSize + (maxSize - minSize) * depth;
        if (land) {
          ctx.fillStyle = front
            ? depth > 0.78
              ? colors.landCore
              : colors.landFront
            : colors.landBack;
          ctx.globalAlpha = front ? 0.38 + depth * 0.55 : 0.12 + depth * 0.18;
        } else {
          ctx.fillStyle = front ? colors.oceanFront : colors.oceanBack;
          ctx.globalAlpha = front ? 0.18 + depth * 0.28 : 0.08 + depth * 0.1;
        }
        ctx.beginPath();
        ctx.arc(cx + x * radius, cy - y * radius, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const paint = () => {
      const dark = document.documentElement.classList.contains("dark");
      const colors = palette(dark);
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.46;
      const cosY = Math.cos(angle);
      const sinY = Math.sin(angle);
      const cosX = Math.cos(TILT);
      const sinX = Math.sin(TILT);
      const step = compact.matches ? 2 : 1;

      ctx.clearRect(0, 0, width, height);
      drawDots(OCEAN_DOTS, colors, false, false, radius, cx, cy, cosY, sinY, cosX, sinX, 1);
      drawDots(LAND_DOTS, colors, true, false, radius, cx, cy, cosY, sinY, cosX, sinX, step);
      drawDots(OCEAN_DOTS, colors, false, true, radius, cx, cy, cosY, sinY, cosX, sinX, 1);
      drawDots(LAND_DOTS, colors, true, true, radius, cx, cy, cosY, sinY, cosX, sinX, step);
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      if (!running || !shouldAnimate()) return;
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      angle += delta * ROTATE_SPEED;
      paint();
      frame = window.requestAnimationFrame(tick);
    };

    const start = () => {
      window.cancelAnimationFrame(frame);
      last = performance.now();
      paint();
      if (shouldAnimate()) frame = window.requestAnimationFrame(tick);
    };

    syncSize();
    start();

    const resize = () => {
      syncSize();
      if (!shouldAnimate()) paint();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        intersecting = Boolean(entry?.isIntersecting);
        if (intersecting) start();
        else window.cancelAnimationFrame(frame);
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    const resizeObserver = new ResizeObserver(() => {
      syncSize();
      if (!shouldAnimate()) paint();
    });
    resizeObserver.observe(canvas);

    const themeObserver = new MutationObserver(() => paint());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("resize", resize);
    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else window.cancelAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className={cn("hero-globe", className)} aria-hidden>
      <canvas ref={canvasRef} />
    </div>
  );
}
