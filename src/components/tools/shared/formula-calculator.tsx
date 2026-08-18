"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type CalcField =
  | {
      id: string;
      label: string;
      kind: "number";
      min?: number;
      max?: number;
      step?: number;
      default: number;
      prefix?: string;
      suffix?: string;
    }
  | {
      id: string;
      label: string;
      kind: "select";
      options: { label: string; value: string }[];
      default: string;
    }
  | { id: string; label: string; kind: "text"; default: string; placeholder?: string }
  | { id: string; label: string; kind: "date"; default: string };

export type CalcResult = { label: string; value: string; emphasize?: boolean };

export type CalcConfig = {
  fields: CalcField[];
  compute: (values: Record<string, string | number>) => CalcResult[];
  note?: string;
};

function initialValues(config: CalcConfig) {
  const next: Record<string, string | number> = {};
  for (const field of config.fields) next[field.id] = field.default;
  return next;
}

function parseValues(config: CalcConfig, values: Record<string, string | number>) {
  const parsed: Record<string, string | number> = {};
  for (const field of config.fields) {
    const raw = values[field.id];
    if (field.kind === "number") {
      const num = typeof raw === "number" ? raw : Number(String(raw).trim());
      parsed[field.id] = Number.isFinite(num) ? num : 0;
    } else {
      parsed[field.id] = raw ?? "";
    }
  }
  return parsed;
}

export function FormulaCalculator({ config }: { config: CalcConfig }) {
  const seed = useMemo(() => initialValues(config), [config]);
  const [values, setValues] = useState<Record<string, string | number>>(seed);

  useEffect(() => {
    setValues(seed);
  }, [seed]);

  const results = useMemo(() => {
    try {
      return config.compute(parseValues(config, values));
    } catch (error) {
      return [{ label: "Error", value: error instanceof Error ? error.message : "Could not calculate" }];
    }
  }, [config, values]);

  const setField = (id: string, value: string | number) => {
    setValues((current) => ({ ...current, [id]: value }));
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        {config.fields.map((field) => (
          <div key={field.id}>
            <Label htmlFor={field.id}>{field.label}</Label>
            {field.kind === "select" ? (
              <select
                id={field.id}
                className="mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm"
                value={String(values[field.id] ?? field.default)}
                onChange={(event) => setField(field.id, event.target.value)}
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-1 flex items-center gap-2">
                {"prefix" in field && field.prefix ? <span className="text-sm text-[var(--muted-ink)]">{field.prefix}</span> : null}
                <Input
                  id={field.id}
                  type={field.kind === "date" ? "date" : field.kind === "number" ? "text" : "text"}
                  inputMode={field.kind === "number" ? "decimal" : undefined}
                  min={field.kind === "number" ? field.min : undefined}
                  max={field.kind === "number" ? field.max : undefined}
                  placeholder={field.kind === "text" ? field.placeholder : undefined}
                  value={String(values[field.id] ?? "")}
                  aria-describedby={config.note ? "calc-note" : undefined}
                  onChange={(event) => {
                    const raw = event.target.value;
                    if (field.kind === "number") {
                      if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) setField(field.id, raw);
                      return;
                    }
                    setField(field.id, raw);
                  }}
                />
                {"suffix" in field && field.suffix ? <span className="text-sm text-[var(--muted-ink)]">{field.suffix}</span> : null}
              </div>
            )}
          </div>
        ))}
        <Button type="button" variant="ghost" onClick={() => setValues(seed)}>
          Reset
        </Button>
      </div>
      <div className="space-y-3 rounded-lg bg-surface-soft p-5" aria-live="polite">
        {results.map((result) => (
          <div key={result.label}>
            <p className="text-sm text-[var(--muted-ink)]">{result.label}</p>
            <p className={result.emphasize ? "text-3xl font-semibold tracking-tight" : "text-lg font-medium"}>{result.value}</p>
          </div>
        ))}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await navigator.clipboard.writeText(results.map((item) => `${item.label}: ${item.value}`).join("\n"));
              toast.success("Copied results");
            }}
          >
            Copy results
          </Button>
        </div>
        {config.note ? (
          <p id="calc-note" className="pt-2 text-xs text-[var(--muted-ink)]">
            {config.note}
          </p>
        ) : null}
      </div>
    </div>
  );
}
