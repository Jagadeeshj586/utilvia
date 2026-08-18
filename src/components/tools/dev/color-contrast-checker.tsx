"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeHex } from "@/lib/color/conversion";
import {
  contrastRatio,
  contrastSummary,
  formatContrastRatio,
  wcagBadges,
  type WcagLevel,
} from "@/lib/color/contrast";
import { cn } from "@/lib/utils";

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const normalized = normalizeHex(value);

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1 flex items-center gap-2">
        <Input
          type="color"
          aria-label={`${label} color picker`}
          value={normalized ?? "#000000"}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-11 w-11 shrink-0 cursor-pointer p-1"
        />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          autoCapitalize="characters"
          placeholder="#000000"
          className="min-h-11 font-mono uppercase"
          aria-invalid={value.length > 0 && !normalized}
        />
      </div>
    </div>
  );
}

function WcagBadgeCard({ label, level }: { label: string; level: WcagLevel }) {
  const passed = level === "pass";
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-3 py-3 text-sm",
        passed ? "border-teal/40 bg-teal/10" : "border-destructive/40 bg-destructive/10",
      )}
      role="status"
      aria-label={`${label}: ${passed ? "Pass" : "Fail"}`}
    >
      <span className="font-medium text-ink">{label}</span>
      <span className={cn("inline-flex items-center gap-1.5 font-medium", passed ? "text-teal" : "text-destructive")}>
        {passed ? <Check className="h-4 w-4" aria-hidden="true" /> : <X className="h-4 w-4" aria-hidden="true" />}
        {passed ? "Pass" : "Fail"}
      </span>
    </div>
  );
}

export function ColorContrastCheckerTool() {
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#FFFFFF");

  const fgHex = normalizeHex(foreground);
  const bgHex = normalizeHex(background);
  const ratio = useMemo(() => contrastRatio(foreground, background), [foreground, background]);
  const badges = ratio != null ? wcagBadges(ratio) : [];

  const swapColors = () => {
    setForeground(background);
    setBackground(foreground);
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Check contrast</h2>
          <p className="mt-1 text-sm text-[var(--body)]">
            Pick foreground and background colors to see the WCAG contrast ratio and pass/fail badges.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField id="cc-fg" label="Foreground" value={foreground} onChange={setForeground} />
          <ColorField id="cc-bg" label="Background" value={background} onChange={setBackground} />
        </div>

        <Button type="button" variant="outline" className="min-h-11" onClick={swapColors}>
          <ArrowLeftRight className="mr-2 h-4 w-4" aria-hidden="true" />
          Swap colors
        </Button>

        {ratio != null && fgHex && bgHex ? (
          <>
            <div
              className="rounded-xl border border-[var(--hairline)] px-5 py-8"
              style={{ color: fgHex, backgroundColor: bgHex }}
            >
              <p className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Sample Text Preview</p>
              <p className="mt-3 text-base leading-relaxed sm:text-lg">
                The quick brown fox jumps over the lazy dog
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Contrast Ratio</p>
                <p className="mt-1 font-display text-4xl font-semibold tabular-nums text-coral sm:text-5xl">
                  {formatContrastRatio(ratio)}
                </p>
                <p className="mt-2 text-sm text-[var(--body)]">{contrastSummary(ratio)}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {badges.map((badge) => (
                  <WcagBadgeCard key={badge.id} label={badge.label} level={badge.level} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="rounded-lg border border-dashed border-[var(--hairline)] bg-surface-soft px-4 py-6 text-sm text-muted-foreground">
            Enter two valid hex colors (for example <span className="font-mono">#000000</span> and{" "}
            <span className="font-mono">#FFFFFF</span>) to calculate contrast.
          </p>
        )}
      </section>
    </div>
  );
}
