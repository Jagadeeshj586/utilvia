"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DICE_SIDES,
  formatListCsv,
  formatListOutput,
  generateNumberList,
  generateSingleNumber,
  generateUuid,
  rollDice,
  type DiceSides,
  type RandomMode,
} from "@/lib/random/generate";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

export function RandomNumberGeneratorTool() {
  const [mode, setMode] = useState<RandomMode>("single");
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("10");
  const [unique, setUnique] = useState(false);
  const [diceSides, setDiceSides] = useState<DiceSides>(6);
  const [diceCount, setDiceCount] = useState("1");
  const [singleResult, setSingleResult] = useState<number | null>(null);
  const [listResult, setListResult] = useState<number[]>([]);
  const [uuidResult, setUuidResult] = useState("");
  const [diceResult, setDiceResult] = useState<number[]>([]);
  const [diceTotal, setDiceTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const clearResults = () => {
    setSingleResult(null);
    setListResult([]);
    setUuidResult("");
    setDiceResult([]);
    setDiceTotal(null);
    setError(null);
  };

  const onCopy = async (key: string, value: string) => {
    if (!value) return;
    const ok = await copyText(value);
    if (ok) {
      setCopied(key);
      toast.success("Copied");
      window.setTimeout(() => setCopied(null), 2000);
    } else {
      toast.error("Could not copy");
    }
  };

  const onGenerateSingle = () => {
    clearResults();
    const result = generateSingleNumber({ min: Number(min), max: Number(max) });
    if (result.error) {
      setError(result.error);
      return;
    }
    setSingleResult(result.value);
  };

  const onGenerateList = () => {
    clearResults();
    const result = generateNumberList({
      min: Number(min),
      max: Number(max),
      count: Number(count),
      unique,
    });
    if (result.error) {
      setError(result.error);
      return;
    }
    setListResult(result.values);
  };

  const onGenerateUuid = () => {
    clearResults();
    setUuidResult(generateUuid());
  };

  const onRollDice = () => {
    clearResults();
    const result = rollDice({ sides: diceSides, count: Number(diceCount) });
    if (result.error) {
      setError(result.error);
      return;
    }
    setDiceResult(result.values);
    setDiceTotal(result.total);
  };

  const copyLabel = (key: string, fallback: string) => (copied === key ? "Copied!" : fallback);

  return (
    <div className="space-y-4">
      <Tabs
        value={mode}
        onValueChange={(value) => {
          setMode(value as RandomMode);
          clearResults();
        }}
      >
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-none bg-transparent p-0">
          <TabsTrigger value="single">Single</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="uuid">UUID</TabsTrigger>
          <TabsTrigger value="dice">Dice</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "single" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="rng-min">Min</Label>
              <Input id="rng-min" type="number" value={min} onChange={(event) => setMin(event.target.value)} className="mt-1 font-mono tabular-nums" />
            </div>
            <div>
              <Label htmlFor="rng-max">Max</Label>
              <Input id="rng-max" type="number" value={max} onChange={(event) => setMax(event.target.value)} className="mt-1 font-mono tabular-nums" />
            </div>
          </div>
          <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-8 text-center" aria-live="polite">
            <p className="font-display text-5xl font-semibold tabular-nums text-ink">{singleResult ?? "—"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={onGenerateSingle}>
              Generate
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={singleResult == null}
              onClick={() => void onCopy("single", String(singleResult ?? ""))}
            >
              {copied === "single" ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copyLabel("single", "Copy")}
            </Button>
          </div>
        </div>
      ) : null}

      {mode === "list" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="rng-list-min">Min</Label>
              <Input id="rng-list-min" type="number" value={min} onChange={(event) => setMin(event.target.value)} className="mt-1 font-mono tabular-nums" />
            </div>
            <div>
              <Label htmlFor="rng-list-max">Max</Label>
              <Input id="rng-list-max" type="number" value={max} onChange={(event) => setMax(event.target.value)} className="mt-1 font-mono tabular-nums" />
            </div>
            <div>
              <Label htmlFor="rng-count">Count</Label>
              <Input id="rng-count" type="number" min={1} value={count} onChange={(event) => setCount(event.target.value)} className="mt-1 font-mono tabular-nums" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--body)]">
            <input
              type="checkbox"
              checked={unique}
              onChange={(event) => setUnique(event.target.checked)}
              className="h-4 w-4 rounded border-[var(--hairline)]"
            />
            No duplicates
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={onGenerateList}>
              Generate List
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!listResult.length}
              onClick={() => void onCopy("list", formatListOutput(listResult))}
            >
              {copied === "list" ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copyLabel("list", "Copy All")}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!listResult.length}
              onClick={() => void onCopy("csv", formatListCsv(listResult))}
            >
              {copied === "csv" ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copyLabel("csv", "Copy as CSV")}
            </Button>
          </div>
          {listResult.length ? (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {listResult.map((value, index) => (
                <li key={`${value}-${index}`} className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-3 py-2 text-center font-mono tabular-nums">
                  {value}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {mode === "uuid" ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-6 text-center" aria-live="polite">
            <p className="font-mono text-sm text-[var(--body)]">{uuidResult || "Click Generate UUID"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={onGenerateUuid}>
              Generate UUID
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!uuidResult}
              onClick={() => void onCopy("uuid", uuidResult)}
            >
              {copied === "uuid" ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copyLabel("uuid", "Copy")}
            </Button>
          </div>
        </div>
      ) : null}

      {mode === "dice" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {DICE_SIDES.map((sides) => (
              <button
                key={sides}
                type="button"
                onClick={() => setDiceSides(sides)}
                className={cn(
                  "rounded-lg border px-4 py-2 font-mono text-sm transition-colors",
                  diceSides === sides ? "border-primary bg-primary/10 text-primary" : "border-[var(--hairline)] bg-surface-soft text-ink hover:border-primary/40",
                )}
              >
                d{sides}
              </button>
            ))}
          </div>
          <div className="max-w-xs">
            <Label htmlFor="dice-count">Number of dice (1–10)</Label>
            <Input
              id="dice-count"
              type="number"
              min={1}
              max={10}
              value={diceCount}
              onChange={(event) => setDiceCount(event.target.value)}
              className="mt-1 font-mono tabular-nums"
            />
          </div>
          <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-6 text-center" aria-live="polite">
            {diceResult.length ? (
              <div className="space-y-2">
                <p className="font-display text-4xl font-semibold tabular-nums text-ink">{diceResult.join(", ")}</p>
                {diceResult.length > 1 ? <p className="text-sm text-muted-foreground">Total: {diceTotal}</p> : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Roll to see results</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={onRollDice}>
              Roll Dice
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!diceResult.length}
              onClick={() => void onCopy("dice", diceResult.join(", "))}
            >
              {copied === "dice" ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copyLabel("dice", "Copy")}
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
