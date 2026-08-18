import { cn } from "@/lib/utils";

export function GradientBackground({ className }: { className?: string }) {
  return (
    <div className={cn("hero-atmosphere", className)} aria-hidden>
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
