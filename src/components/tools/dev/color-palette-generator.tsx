"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_BRAND_HEX,
  buildPaletteScale,
  formatSwatchValue,
  paletteCode,
  parseBrandHex,
  type ColorDisplayFormat,
  type PaletteCodeFormat,
} from "@/lib/color-palette/generate";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

const DISPLAY_FORMATS: Array<{ id: ColorDisplayFormat; label: string }> = [
  { id: "hex", label: "HEX" },
  { id: "rgb", label: "RGB" },
  { id: "hsl", label: "HSL" },
];

const CODE_FORMATS: Array<{ id: PaletteCodeFormat; label: string }> = [
  { id: "tailwind", label: "Tailwind Config" },
  { id: "css", label: "CSS Variables" },
];

function Pill({
  pressed,
  children,
  onClick,
}: {
  pressed: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
        pressed
          ? "border-coral bg-coral text-white"
          : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function ColorPaletteGenerator({ seed = DEFAULT_BRAND_HEX }: { seed?: string }) {
  const initial = parseBrandHex(seed) ?? DEFAULT_BRAND_HEX;
  const [hex, setHex] = useState(initial);
  const [format, setFormat] = useState<ColorDisplayFormat>("hex");
  const [codeFormat, setCodeFormat] = useState<PaletteCodeFormat>("tailwind");
  const [copiedShade, setCopiedShade] = useState<number | "all" | null>(null);

  const parsed = parseBrandHex(hex);
  const swatches = useMemo(() => buildPaletteScale(parsed ?? initial) ?? [], [parsed, initial]);
  const code = useMemo(() => paletteCode(swatches, codeFormat), [swatches, codeFormat]);
  const invalid = hex.trim().length > 0 && !parsed;

  const copyValue = async (value: string, key: number | "all", label: string) => {
    const ok = await copyText(value);
    if (!ok) {
      toast.error("Could not copy");
      return;
    }
    setCopiedShade(key);
    toast.success(label);
    window.setTimeout(() => setCopiedShade((current) => (current === key ? null : current)), 1600);
  };

  const reset = () => {
    setHex(DEFAULT_BRAND_HEX);
    setFormat("hex");
    setCodeFormat("tailwind");
    setCopiedShade(null);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted-ink)]">
        Enter a brand hex to generate a Tailwind 50–950 scale. Copy each shade, or export the full config.
      </p>

      <div className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Brand color</p>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="palette-picker" className="sr-only">
              Color picker
            </Label>
            <input
              id="palette-picker"
              type="color"
              value={parsed ?? initial}
              onChange={(event) => setHex(event.target.value)}
              aria-label="Brand color picker"
              className="h-11 w-14 cursor-pointer rounded-lg border border-[var(--hairline)] bg-transparent p-1"
            />
          </div>
          <div className="min-w-[12rem] flex-1">
            <Label htmlFor="palette-hex">Hex</Label>
            <Input
              id="palette-hex"
              value={hex}
              onChange={(event) => setHex(event.target.value)}
              placeholder={DEFAULT_BRAND_HEX}
              spellCheck={false}
              autoCapitalize="characters"
              className="mt-1 min-h-11 font-mono uppercase"
              aria-invalid={invalid}
            />
          </div>
          <Button type="button" variant="outline" className="min-h-11" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
        {invalid ? (
          <p className="text-sm text-destructive">Enter a valid 3 or 6 digit hex, like {DEFAULT_BRAND_HEX}.</p>
        ) : null}

        <div
          className="flex h-12 overflow-hidden rounded-lg border border-[var(--hairline)]"
          role="img"
          aria-label="Generated 50 to 950 scale"
        >
          {swatches.map((swatch) => (
            <span key={swatch.shade} className="h-full flex-1" style={{ backgroundColor: swatch.hex }} title={`${swatch.shade} ${swatch.hex}`} />
          ))}
        </div>

        <div>
          <Label>Display format</Label>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Color format">
            {DISPLAY_FORMATS.map((item) => (
              <Pill key={item.id} pressed={format === item.id} onClick={() => setFormat(item.id)}>
                {item.label}
              </Pill>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--hairline)] bg-surface-card">
        <div className="border-b border-[var(--hairline)] px-4 py-3 sm:px-5">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Scale</p>
          <p className="mt-1 text-sm text-[var(--muted-ink)]">Shade 500 is your brand color. Badges show whether black or white text meets WCAG AA.</p>
        </div>
        <ul className="divide-y divide-[var(--hairline)]">
          {swatches.map((swatch) => {
            const value = formatSwatchValue(swatch, format);
            const whiteText = swatch.contrastLabel === "W";
            const copied = copiedShade === swatch.shade;
            return (
              <li key={swatch.shade} className="flex items-center gap-3 px-3 py-2.5 sm:px-5">
                <div
                  className="h-11 w-11 shrink-0 rounded-md border border-[var(--hairline)]"
                  style={{ backgroundColor: swatch.hex }}
                  aria-hidden
                />
                <span className="w-9 shrink-0 text-sm font-medium tabular-nums text-[var(--muted-ink)]">{swatch.shade}</span>
                <code className="min-w-0 flex-1 truncate font-mono text-sm text-ink">{value}</code>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium",
                    whiteText ? "bg-ink text-canvas" : "bg-surface-soft text-ink",
                  )}
                  title={
                    whiteText
                      ? "White text meets WCAG AA on this shade"
                      : "Black text meets WCAG AA on this shade"
                  }
                >
                  {whiteText ? "✅ W" : "✅ B"}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="min-h-9 shrink-0"
                  onClick={() => void copyValue(value, swatch.shade, `Copied ${swatch.shade}`)}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-teal" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Export</p>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Code output format">
              {CODE_FORMATS.map((item) => (
                <Pill
                  key={item.id}
                  pressed={codeFormat === item.id}
                  onClick={() => {
                    setCodeFormat(item.id);
                    setCopiedShade(null);
                  }}
                >
                  {item.label}
                </Pill>
              ))}
            </div>
          </div>
          <Button
            type="button"
            className="min-h-10 min-w-28 px-6"
            onClick={() => void copyValue(code, "all", "Copied palette")}
          >
            {copiedShade === "all" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedShade === "all" ? "Copied" : "Copy All"}
          </Button>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-[var(--hairline)] bg-surface-soft p-3 text-xs leading-6 text-ink">
          <code>{code}</code>
        </pre>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "50–950 scale", body: "Full Tailwind color range" },
          { title: "HSL algorithm", body: "Consistent tint & shade" },
          { title: "WCAG contrast", body: "White or black text badge" },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-3">
            <p className="text-sm font-medium text-ink">{item.title}</p>
            <p className="mt-0.5 text-sm text-[var(--muted-ink)]">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
