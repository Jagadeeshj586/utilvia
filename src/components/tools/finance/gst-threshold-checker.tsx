"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_GST_THRESHOLD_INPUT,
  GST_THRESHOLD_RULES,
  STATE_OPTIONS,
  SUPPLY_OPTIONS,
  calculateGstThreshold,
  gstThresholdCopyText,
  hasGstThresholdErrors,
  validateGstThreshold,
  type GstStateKind,
  type GstSupplyType,
  type GstThresholdInput,
} from "@/lib/gst-threshold/calculate";
import { copyText } from "@/lib/security/clipboard";
import { cn, formatCompactINR, formatINR } from "@/lib/utils";

const selectClass =
  "mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary";

const TURNOVER_PRESETS = [10_00_000, 15_00_000, 20_00_000, 40_00_000];

type Draft = {
  turnover: string;
  supply: GstSupplyType;
  state: GstStateKind;
  interstate: boolean;
  exportSupply: boolean;
  digitalOverseas: boolean;
};

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[₹\s,]/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function formatDraftAmount(value: number) {
  if (!Number.isFinite(value)) return "";
  return Math.round(value).toLocaleString("en-IN");
}

function toDraft(input: GstThresholdInput): Draft {
  return {
    turnover: formatDraftAmount(input.turnover),
    supply: input.supply,
    state: input.state,
    interstate: input.interstate,
    exportSupply: input.exportSupply,
    digitalOverseas: input.digitalOverseas,
  };
}

export function GstThresholdChecker() {
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_GST_THRESHOLD_INPUT));
  const [copied, setCopied] = useState(false);

  const input = useMemo<GstThresholdInput>(
    () => ({
      turnover: parseAmount(draft.turnover),
      supply: draft.supply,
      state: draft.state,
      interstate: draft.interstate,
      exportSupply: draft.exportSupply,
      digitalOverseas: draft.digitalOverseas,
    }),
    [draft],
  );
  const errors = useMemo(() => validateGstThreshold(input), [input]);
  const result = useMemo(() => calculateGstThreshold(input), [input]);
  const invalid = hasGstThresholdErrors(errors);

  const patch = (next: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...next }));
    setCopied(false);
  };

  const copyResult = async () => {
    if (!result) return;
    const ok = await copyText(gstThresholdCopyText(result));
    if (!ok) {
      toast.error("Could not copy");
      return;
    }
    setCopied(true);
    toast.success("Copied");
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--body)]">
        Check whether GST registration is required from turnover, supply type, state, inter-state, and export rules.
        The verdict updates as you type.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <form
          className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5"
          onSubmit={(event) => event.preventDefault()}
        >
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Configure</p>

          <Field
            id="gst-turnover"
            label="Annual Aggregate Turnover (₹)"
            hint="Total income from all services/goods this financial year — domestic + exports"
            error={errors.turnover}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">
                ₹
              </span>
              <Input
                id="gst-turnover"
                inputMode="decimal"
                value={draft.turnover}
                aria-invalid={Boolean(errors.turnover)}
                className="pl-7 tabular-nums"
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^[\d,]*\.?[\d]*$/.test(raw)) patch({ turnover: raw });
                }}
                onBlur={() => {
                  const value = parseAmount(draft.turnover);
                  if (Number.isFinite(value)) patch({ turnover: formatDraftAmount(value) });
                }}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {TURNOVER_PRESETS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={cn(
                    "min-h-9 rounded-lg border px-2.5 text-xs font-medium transition-colors",
                    input.turnover === value
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => patch({ turnover: formatDraftAmount(value) })}
                >
                  {formatCompactINR(value)}
                </button>
              ))}
            </div>
          </Field>

          <Field id="gst-supply" label="Supply Type">
            <select
              id="gst-supply"
              className={selectClass}
              value={draft.supply}
              onChange={(event) => patch({ supply: event.target.value as GstSupplyType })}
            >
              {SUPPLY_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>

          <Field id="gst-state" label="State of Business">
            <select
              id="gst-state"
              className={selectClass}
              value={draft.state}
              onChange={(event) => patch({ state: event.target.value as GstStateKind })}
            >
              {STATE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>

          <YesNo
            label="Do you supply to other states (inter-state)?"
            value={draft.interstate}
            onChange={(value) => patch({ interstate: value })}
          />
          <YesNo
            label="Do you export services/goods outside India?"
            value={draft.exportSupply}
            onChange={(value) => patch({ exportSupply: value })}
          />
          <YesNo
            label="Are you a digital/IT service provider to overseas clients?"
            value={draft.digitalOverseas}
            onChange={(value) => patch({ digitalOverseas: value })}
          />

          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setDraft(toDraft(DEFAULT_GST_THRESHOLD_INPUT))}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </form>

        <div className="space-y-4">
          {invalid || !result ? (
            <p className="rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-4 py-8 text-center text-sm text-[var(--muted-ink)]">
              Enter turnover and your supply details to see if GST registration is required.
            </p>
          ) : (
            <>
              <div
                className={cn(
                  "rounded-xl border px-4 py-4",
                  result.mandatory ? "border-amber/40 bg-amber/10" : "border-teal/40 bg-teal/10",
                )}
              >
                <p className="font-display text-2xl font-semibold text-ink">{result.headline}</p>
                <p className="mt-2 text-sm text-[var(--body)]">{result.detail}</p>
                <Button type="button" size="sm" variant="outline" className="mt-4" onClick={() => void copyResult()}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy verdict"}
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">Threshold</p>
                  <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{formatINR(result.threshold)}</p>
                </div>
                <div className="rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">Your Turnover</p>
                  <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{formatINR(result.turnover)}</p>
                </div>
              </div>

              {result.mandatory ? null : (
                <p className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-3 text-sm text-[var(--body)]">
                  Voluntary registration benefit: Even if not mandatory, many IT freelancers register to claim input tax
                  credit, issue GST invoices to B2B clients, and simplify future compliance.
                </p>
              )}
            </>
          )}

          <p className="text-xs text-[var(--muted-ink)]">
            GST rules change frequently. This tool reflects {GST_THRESHOLD_RULES.fyLabel} thresholds. Consult a CA for
            complex scenarios involving multiple business verticals or recent turnover.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "₹20L threshold", desc: "Services in regular states" },
          { title: "Inter-state", desc: "Mandatory regardless of turnover" },
          { title: "Export rules", desc: "Zero-rated with LUT" },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-3">
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-xs text-[var(--muted-ink)]">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function YesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={label}>
        {[
          { id: false, name: "No" },
          { id: true, name: "Yes" },
        ].map((option) => (
          <button
            key={String(option.id)}
            type="button"
            className={cn(
              "min-h-10 rounded-lg border px-4 text-sm font-medium transition-colors",
              value === option.id
                ? "border-coral bg-coral text-white"
                : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
            )}
            onClick={() => onChange(option.id)}
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {hint ? <p className="mt-0.5 text-xs text-[var(--muted-ink)]">{hint}</p> : null}
      <div className="mt-1">{children}</div>
      {error ? <p className="mt-1 text-xs text-[var(--error)]">{error}</p> : null}
    </div>
  );
}
