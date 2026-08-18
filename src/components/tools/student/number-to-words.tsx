"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  convertNumberToWords,
  formatGroupedNumber,
  INDIAN_EXAMPLES,
  INTERNATIONAL_EXAMPLES,
  maxLabelForSystem,
  parseDigits,
  type CurrencySuffix,
  type NumberSystem,
} from "@/lib/number-to-words/convert";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

export function NumberToWordsTool() {
  const [system, setSystem] = useState<NumberSystem>("indian");
  const [currency, setCurrency] = useState<CurrencySuffix>("INR");
  const [currencySuffix, setCurrencySuffix] = useState(false);
  const [input, setInput] = useState(formatGroupedNumber(100000, "indian"));
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      convertNumberToWords({
        input,
        system,
        currencySuffix,
        currency,
      }),
    [currency, currencySuffix, input, system],
  );

  const examples = system === "indian" ? INDIAN_EXAMPLES : INTERNATIONAL_EXAMPLES;

  const onSystemChange = (next: NumberSystem) => {
    setSystem(next);
    setCurrency(next === "indian" ? "INR" : "USD");
    const digits = parseDigits(input);
    setInput(digits ? formatGroupedNumber(digits, next) : "");
  };

  const onInputChange = (value: string) => {
    const digits = parseDigits(value);
    setInput(digits ? formatGroupedNumber(digits, system) : "");
  };

  const onCopy = async () => {
    if (!result.words) return;
    const ok = await copyText(result.words);
    if (ok) {
      setCopied(true);
      toast.success("Copied");
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={system} onValueChange={(value) => onSystemChange(value as NumberSystem)}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-none bg-transparent p-0">
          <TabsTrigger value="indian">Indian System</TabsTrigger>
          <TabsTrigger value="international">International</TabsTrigger>
        </TabsList>
      </Tabs>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <Label htmlFor="ntw-input">Enter Number</Label>
          <p className="text-xs text-muted-foreground">Max: {maxLabelForSystem(system)}</p>
        </div>
        <Input
          id="ntw-input"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Type a number"
          inputMode="numeric"
          className="mt-2 font-mono text-base tabular-nums"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-[var(--body)]">
          <input
            type="checkbox"
            checked={currencySuffix}
            onChange={(event) => setCurrencySuffix(event.target.checked)}
            className="h-4 w-4 rounded border-[var(--hairline)]"
          />
          Add currency suffix ({currency === "INR" ? "Rupees" : "Dollars"})
        </label>
        <div className="flex gap-2">
          {(["INR", "USD"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={currency === value ? "default" : "outline"}
              onClick={() => setCurrency(value)}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      {result.error ? (
        <p className="text-sm text-destructive" role="alert">
          {result.error}
        </p>
      ) : null}

      <section className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-4 sm:p-5" aria-live="polite">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-ink">In Words</h3>
          <Button type="button" variant="outline" size="sm" disabled={!result.words} onClick={() => void onCopy()}>
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <p className={cn("text-xl font-medium", result.words ? "text-ink" : "text-muted-foreground")}>
          {result.words || "Enter a valid number"}
        </p>
      </section>

      <section>
        <h3 className="text-sm font-medium text-ink">Examples</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((example) => {
            const label = formatGroupedNumber(example, system);
            return (
              <button
                key={`${system}-${example}`}
                type="button"
                onClick={() => setInput(label)}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-mono text-sm transition-colors",
                  parseDigits(input) === String(example)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-[var(--hairline)] bg-surface-soft text-[var(--body)] hover:border-primary/40",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
