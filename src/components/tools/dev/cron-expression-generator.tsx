"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  CRON_PRESETS,
  FIELD_SPECS,
  FIELD_ORDER_5,
  FIELD_ORDER_6,
  buildExpression,
  defaultConfig,
  defaultField,
  describeCron,
  fieldBreakdown,
  parseExpression,
  type CronConfig,
  type CronFieldId,
  type FieldConfig,
  type FieldMode,
  type FieldSpec,
} from "@/lib/cron/cron";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

const MODES: Array<{ id: FieldMode; label: string }> = [
  { id: "every", label: "Every" },
  { id: "interval", label: "Interval" },
  { id: "specific", label: "Specific" },
  { id: "range", label: "Range" },
];

function valuesFor(spec: FieldSpec) {
  const list: number[] = [];
  for (let value = spec.min; value <= spec.max; value += 1) list.push(value);
  return list;
}

export function CronExpressionGenerator() {
  const [config, setConfig] = useState<CronConfig>(defaultConfig);
  const [draft, setDraft] = useState(() => {
    const built = buildExpression(defaultConfig());
    return built.ok ? built.expression : "0 9 * * *";
  });
  const [copied, setCopied] = useState(false);

  const built = useMemo(() => buildExpression(config), [config]);
  const parsedDraft = useMemo(() => parseExpression(draft), [draft]);
  const expression = built.ok ? built.expression : "—";
  const liveError = !parsedDraft.ok ? parsedDraft.error : !built.ok ? built.error : null;
  const description = built.ok ? describeCron(config) : null;
  const breakdown = built.ok ? fieldBreakdown(config) : [];

  const applyConfig = (next: CronConfig) => {
    const result = buildExpression(next);
    setConfig(next);
    if (result.ok) setDraft(result.expression);
  };

  const updateField = (id: CronFieldId, field: FieldConfig) => {
    applyConfig({ ...config, [id]: field });
  };

  const setMode = (id: CronFieldId, mode: FieldMode) => {
    const spec = FIELD_SPECS[id];
    const current = config[id];
    if (mode === "specific" && current.values.length === 0) {
      updateField(id, { ...current, mode, values: [spec.min] });
      return;
    }
    updateField(id, { ...current, mode });
  };

  const onDraftChange = (value: string) => {
    setDraft(value);
    const parsed = parseExpression(value);
    if (parsed.ok) setConfig(parsed.config);
  };

  const onDraftBlur = () => {
    const parsed = parseExpression(draft);
    if (parsed.ok) {
      setConfig(parsed.config);
      setDraft(parsed.expression);
    }
  };

  const toggleSeconds = (includeSeconds: boolean) => {
    applyConfig({
      ...config,
      includeSeconds,
      second: includeSeconds
        ? config.second.mode === "every"
          ? { ...defaultField(FIELD_SPECS.second, "specific"), values: [0] }
          : config.second
        : config.second,
    });
  };

  const applyPreset = (expression: string) => {
    const parsed = parseExpression(expression);
    if (!parsed.ok) return;
    setConfig(parsed.config);
    setDraft(parsed.expression);
  };

  const reset = () => {
    const next = defaultConfig();
    applyConfig(next);
  };

  const onCopy = async () => {
    if (!built.ok) return;
    const ok = await copyText(built.expression);
    if (ok) {
      setCopied(true);
      toast.success("Cron expression copied");
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const ids = config.includeSeconds ? FIELD_ORDER_6 : FIELD_ORDER_5;

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Schedule</h2>
            <p className="mt-1 text-sm text-[var(--body)]">Pick values for each field, or paste an expression to parse it.</p>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="cron-seconds" checked={config.includeSeconds} onCheckedChange={toggleSeconds} />
            <Label htmlFor="cron-seconds" className="text-sm font-medium">
              6-field (seconds)
            </Label>
          </div>
        </div>

        <div>
          <Label htmlFor="cron-expression">Cron expression</Label>
          <Input
            id="cron-expression"
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onBlur={onDraftBlur}
            spellCheck={false}
            aria-invalid={liveError ? true : undefined}
            className="mt-1 font-mono text-sm"
            placeholder={config.includeSeconds ? "* * * * * *" : "* * * * *"}
          />
        </div>

        {liveError ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
            {liveError}
          </p>
        ) : null}

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Presets</p>
          <div className="flex flex-wrap gap-2">
            {CRON_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.expression)}
                className={cn(
                  "min-h-10 rounded-lg border px-3 text-sm transition-colors",
                  draft.trim() === preset.expression || expression === preset.expression
                    ? "border-coral bg-coral text-white"
                    : "border-[var(--hairline)] bg-surface-soft text-ink hover:border-primary/40",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        {ids.map((id) => (
          <FieldCard key={id} spec={FIELD_SPECS[id]} field={config[id]} onMode={(mode) => setMode(id, mode)} onChange={(field) => updateField(id, field)} />
        ))}
      </div>

      <section className="space-y-4 rounded-xl border border-primary/30 bg-surface-card p-4 sm:p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted-ink)]">Generated expression</p>
          <p className="mt-2 break-all font-mono text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {expression}
          </p>
          {description ? <p className="mt-2 text-sm text-[var(--body)]">{description}</p> : null}
        </div>

        {breakdown.length > 0 ? (
          <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {breakdown.map((item) => (
              <div key={item.id} className="rounded-lg border border-[var(--hairline)] bg-canvas px-3 py-2">
                <dt className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">{item.label}</dt>
                <dd className="mt-1 font-mono text-sm text-ink">{item.token}</dd>
                <dd className="text-xs text-[var(--muted-ink)]">{item.description}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="button" className="min-h-10 min-w-28" onClick={() => void onCopy()} disabled={!built.ok}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button type="button" variant="outline" className="min-h-10" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </section>
    </div>
  );
}

function FieldCard({
  spec,
  field,
  onMode,
  onChange,
}: {
  spec: FieldSpec;
  field: FieldConfig;
  onMode: (mode: FieldMode) => void;
  onChange: (field: FieldConfig) => void;
}) {
  const options = valuesFor(spec);

  return (
    <section className="space-y-3 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-ink">{spec.label}</h3>
          <p className="text-xs text-[var(--muted-ink)]">
            {spec.min}–{spec.max}
            {spec.id === "dayOfWeek" ? " · Sunday = 0 (7 is also Sunday)" : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label={`${spec.label} mode`}>
          {MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              aria-pressed={field.mode === mode.id}
              onClick={() => onMode(mode.id)}
              className={cn(
                "min-h-9 rounded-lg border px-2.5 text-xs font-medium transition-colors sm:px-3",
                field.mode === mode.id
                  ? "border-coral bg-coral text-white"
                  : "border-[var(--hairline)] bg-canvas text-ink hover:border-primary/40",
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {field.mode === "every" ? (
        <p className="text-sm text-[var(--body)]">Every {spec.unit}.</p>
      ) : null}

      {field.mode === "interval" ? (
        <div className="max-w-xs">
          <Label htmlFor={`${spec.id}-step`}>Every N {spec.unit}s</Label>
          <Input
            id={`${spec.id}-step`}
            type="number"
            min={1}
            max={spec.max}
            value={field.step}
            onChange={(event) => onChange({ ...field, step: Number(event.target.value) || 1 })}
            className="mt-1"
          />
        </div>
      ) : null}

      {field.mode === "range" ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField
            id={`${spec.id}-from`}
            label="From"
            min={spec.min}
            max={spec.max}
            value={field.from}
            onChange={(from) => onChange({ ...field, from })}
          />
          <NumberField
            id={`${spec.id}-to`}
            label="To"
            min={spec.min}
            max={spec.max}
            value={field.to}
            onChange={(to) => onChange({ ...field, to })}
          />
          <NumberField
            id={`${spec.id}-rstep`}
            label="Step"
            min={1}
            max={spec.max}
            value={field.rangeStep}
            onChange={(rangeStep) => onChange({ ...field, rangeStep })}
          />
        </div>
      ) : null}

      {field.mode === "specific" ? (
        <div
          className={cn(
            "grid gap-1",
            spec.labels ? "grid-cols-2 sm:grid-cols-4" : spec.max > 31 ? "grid-cols-8 sm:grid-cols-10 md:grid-cols-12" : "grid-cols-6 sm:grid-cols-8 md:grid-cols-12",
          )}
        >
          {options.map((value) => {
            const selected = field.values.includes(value);
            const label = spec.labels ? spec.labels[spec.id === "month" ? value - 1 : value] : String(value);
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  const values = selected ? field.values.filter((item) => item !== value) : [...field.values, value];
                  onChange({ ...field, values });
                }}
                className={cn(
                  "min-h-8 rounded-md border px-1 text-xs tabular-nums transition-colors",
                  selected
                    ? "border-coral bg-coral text-white"
                    : "border-[var(--hairline)] bg-canvas text-ink hover:border-primary/40",
                )}
              >
                {spec.labels ? label.slice(0, 3) : label}
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function NumberField({
  id,
  label,
  min,
  max,
  value,
  onChange,
}: {
  id: string;
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1"
      />
    </div>
  );
}
