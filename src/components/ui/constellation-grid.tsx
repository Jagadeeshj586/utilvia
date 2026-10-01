"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  radius: number;
  label: string;
  pulse: number;
}

type ConstellationGridProps = {
  className?: string;
  /** background = canvas only for hero; standalone keeps a full demo shell */
  mode?: "background" | "standalone";
};

/** Utilvia constellation grid — cream/ink nodes with coral accent (no cyan/purple). */
export function ConstellationGrid({
  className,
  mode = "background",
}: ConstellationGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let disposed = false;

    const mouse = {
      x: -1000,
      y: -1000,
      prevX: -1000,
      prevY: -1000,
      vx: 0,
      vy: 0,
      radius: 200,
    };

    let nodes: Node[] = [];

    const handleResize = () => {
      const bounds = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNodes();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const bounds = container.getBoundingClientRect();
      mouse.x = e.clientX - bounds.left;
      mouse.y = e.clientY - bounds.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const initNodes = () => {
      nodes = [];
      const spacing = 56;
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;
          nodes.push({
            x,
            y,
            vx: 0,
            vy: 0,
            baseX: x,
            baseY: y,
            radius: Math.random() * 1.1 + 1.0,
            label: `${(i * 7).toString(16).toUpperCase()}:${(j * 11).toString(16).toUpperCase()}`,
            pulse: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let lastTime = performance.now();

    const render = (now: number) => {
      if (disposed) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      mouse.vx = (mouse.x - mouse.prevX) / (dt * 1000 || 1);
      mouse.vy = (mouse.y - mouse.prevY) / (dt * 1000 || 1);
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;

      const speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);

      // Utilvia tokens
      const bgColor = isDarkMode ? "#181715" : "#faf9f5";
      const nodeColor = isDarkMode ? "250, 249, 245" : "20, 20, 19";
      const accentColor = "204, 120, 92"; // --coral #cc785c

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      const SPRING_K = reducedMotion ? 28 : 18;
      const DAMPING = reducedMotion ? 0.72 : 0.82;
      const forceScale = reducedMotion ? 0.35 : 1;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.pulse += dt * (reducedMotion ? 1.2 : 3);

        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const power = 1 - dist / mouse.radius;
          const force = power * (1500 + speed * 150) * forceScale;
          const angle = Math.atan2(dy, dx);
          n.vx -= Math.cos(angle) * force * dt;
          n.vy -= Math.sin(angle) * force * dt;
        }

        const homeDx = n.baseX - n.x;
        const homeDy = n.baseY - n.y;
        n.vx += homeDx * SPRING_K * dt;
        n.vy += homeDy * SPRING_K * dt;
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x += n.vx * dt * 60;
        n.y += n.vy * dt * 60;
      }

      const MAX_CONN_DIST = 75;
      const MAX_CONN_DIST_SQ = MAX_CONN_DIST * MAX_CONN_DIST;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const ndx = n.x - n2.x;
          const ndy = n.y - n2.y;
          const distSq = ndx * ndx + ndy * ndy;
          if (distSq < MAX_CONN_DIST_SQ) {
            const nDist = Math.sqrt(distSq);
            const alpha = (1 - nDist / MAX_CONN_DIST) * (isDarkMode ? 0.16 : 0.1);
            ctx.strokeStyle = `rgba(${nodeColor}, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNear = dist < mouse.radius;
        const baseAlpha = isNear ? 0.95 : 0.22 + Math.sin(n.pulse) * 0.08;

        ctx.fillStyle = isNear
          ? `rgba(${accentColor}, ${baseAlpha})`
          : `rgba(${nodeColor}, ${baseAlpha})`;

        const currentRadius = isNear
          ? n.radius * 2.1
          : n.radius + Math.sin(n.pulse) * 0.25;

        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
        ctx.fill();

        if (dist < 90) {
          const pulseRing = ((n.pulse * 20) % 30) + 4;
          const ringAlpha = (1 - pulseRing / 34) * 0.35;
          ctx.strokeStyle = `rgba(${accentColor}, ${ringAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, pulseRing, 0, Math.PI * 2);
          ctx.stroke();

          ctx.font = "8px ui-monospace, SFMono-Regular, Consolas, monospace";
          ctx.fillStyle = `rgba(${accentColor}, 0.8)`;
          ctx.fillText(n.label, n.x + 10, n.y - 10);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isDarkMode]);

  if (mode === "standalone") {
    return (
      <div
        ref={containerRef}
        className={cn("relative h-screen w-full overflow-hidden bg-canvas select-none", className)}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block cursor-crosshair" aria-hidden />
        <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-ink">
          <h1 className="font-display text-5xl font-semibold tracking-tight md:text-7xl">Constellation</h1>
          <p className="mt-4 max-w-lg text-sm text-[var(--muted-ink)] md:text-base">
            Sweep your cursor across the grid to send kinetic waves through the mesh.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("absolute inset-0 h-full w-full", className)} aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
    </div>
  );
}

export default ConstellationGrid;
