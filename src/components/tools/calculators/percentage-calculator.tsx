"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNum } from "@/lib/utils";

type Mode = "of" | "is" | "change" | "addsub";

export function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("of");
  const [a, setA] = useState("20");
  const [b, setB] = useState("500");
  const [op, setOp] = useState<"add" | "sub">("add");

  const x = Number(a) || 0;
  const y = Number(b) || 0;

  const result = useMemo(() => {
    if (mode === "of") return { label: `${formatNum(x)}% of ${formatNum(y)}`, value: (y * x) / 100 };
    if (mode === "is") return { label: `${formatNum(x)} is what % of ${formatNum(y)}`, value: y === 0 ? 0 : (x / y) * 100 };
    if (mode === "change") return { label: `% change from ${formatNum(x)} to ${formatNum(y)}`, value: x === 0 ? 0 : ((y - x) / x) * 100 };
    const delta = (y * x) / 100;
    return { label: op === "add" ? `${formatNum(y)} + ${formatNum(x)}%` : `${formatNum(y)} − ${formatNum(x)}%`, value: op === "add" ? y + delta : y - delta };
  }, [a, b, mode, op, x, y]);

  return (
    <div className="space-y-6">
      <div>
        <Label>Calculator Mode</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              ["of", "X% of Y"],
              ["is", "X is % of Y"],
              ["change", "% Change"],
              ["addsub", "Add/Subtract"],
            ] as const
          ).map(([id, label]) => (
            <Button key={id} size="sm" variant={mode === id ? "default" : "outline"} onClick={() => setMode(id)}>
              {label}
            </Button>
          ))}
        </div>
      </div>
      {mode === "addsub" ? (
        <div>
          <Label>Operation</Label>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant={op === "add" ? "default" : "outline"} onClick={() => setOp("add")}>
              Add %
            </Button>
            <Button size="sm" variant={op === "sub" ? "default" : "outline"} onClick={() => setOp("sub")}>
              Subtract %
            </Button>
          </div>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="percentage-a">{mode === "of" || mode === "addsub" ? "Percentage (X)" : mode === "is" ? "Value (X)" : "From (X)"}</Label>
          <Input id="percentage-a" value={a} onChange={(event) => setA(event.target.value)} className="mt-1" placeholder="20" />
        </div>
        <div>
          <Label htmlFor="percentage-b">{mode === "change" ? "To (Y)" : "Base (Y)"}</Label>
          <Input id="percentage-b" value={b} onChange={(event) => setB(event.target.value)} className="mt-1" placeholder="500" />
        </div>
      </div>
      <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5">
        <p className="text-sm text-[var(--muted-ink)]">{result.label}</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-ink">
          {formatNum(result.value, 4)}
          {mode === "is" || mode === "change" ? "%" : ""}
        </p>
      </div>
    </div>
  );
}
