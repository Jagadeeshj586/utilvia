"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BASE_FIELDS,
  BINARY_EXAMPLES,
  convertNumberSystems,
  type NumberBase,
} from "@/lib/binary/convert";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

export function BinaryConverterTool() {
  const [values, setValues] = useState({
    binary: "",
    decimal: "255",
    hex: "FF",
    octal: "377",
  });
  const [activeBase, setActiveBase] = useState<NumberBase>("decimal");
  const [copied, setCopied] = useState<NumberBase | null>(null);

  const error = useMemo(() => {
    const source = values[activeBase];
    return convertNumberSystems(source, activeBase).error;
  }, [activeBase, values]);

  const onChange = (base: NumberBase, nextValue: string) => {
    setActiveBase(base);
    const result = convertNumberSystems(nextValue, base);
    if (result.error) {
      setValues((current) => ({ ...current, [base]: nextValue }));
      return;
    }
    setValues({
      binary: result.binary,
      decimal: result.decimal,
      hex: result.hex,
      octal: result.octal,
    });
  };

  const onExample = (decimal: number) => {
    const result = convertNumberSystems(String(decimal), "decimal");
    setActiveBase("decimal");
    setValues({
      binary: result.binary,
      decimal: result.decimal,
      hex: result.hex,
      octal: result.octal,
    });
  };

  const onCopy = async (base: NumberBase) => {
    const value = values[base];
    if (!value) return;
    const ok = await copyText(value);
    if (ok) {
      setCopied(base);
      toast.success(`${BASE_FIELDS.find((field) => field.id === base)?.label} copied`);
      window.setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {BASE_FIELDS.map((field) => (
          <div key={field.id} className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{field.label}</p>
                <p className="text-xs text-muted-foreground">{field.baseLabel}</p>
                <p className="text-xs text-muted-foreground">{field.hint}</p>
              </div>
              <Button type="button" variant="outline" size="sm" disabled={!values[field.id]} onClick={() => void onCopy(field.id)}>
                {copied === field.id ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied === field.id ? "Copied!" : `Copy ${field.label}`}
              </Button>
            </div>
            <Label htmlFor={`${field.id}-input`} className="sr-only">
              {field.label} input
            </Label>
            <Input
              id={`${field.id}-input`}
              value={values[field.id]}
              onChange={(event) => onChange(field.id, event.target.value)}
              placeholder={field.placeholder}
              spellCheck={false}
              aria-invalid={activeBase === field.id && Boolean(error)}
              className="font-mono text-sm uppercase tabular-nums"
            />
          </div>
        ))}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <section>
        <h3 className="text-sm font-medium text-ink">Common examples (decimal)</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {BINARY_EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onExample(example)}
              className={cn(
                "rounded-full border px-3 py-1.5 font-mono text-sm transition-colors",
                values.decimal === String(example)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[var(--hairline)] bg-surface-soft text-[var(--body)] hover:border-primary/40",
              )}
            >
              {example}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
