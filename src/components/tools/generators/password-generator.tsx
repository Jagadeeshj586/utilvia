"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, ChevronDown, Copy, KeyRound, MessageSquareText, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { copyText } from "@/lib/security/clipboard";
import {
  DEFAULT_PASSPHRASE_OPTIONS,
  PASSPHRASE_LIMITS,
  PASSPHRASE_SEPARATORS,
  generatePassphrases,
  type PassphraseOptions,
  type PassphraseSeparator,
} from "@/lib/security/passphrase";
import {
  DEFAULT_PASSWORD_OPTIONS,
  PASSWORD_LIMITS,
  clampBulkCount,
  clampRequiredCount,
  generatePasswords,
  sessionId,
  type PasswordOptions,
} from "@/lib/security/password";
import { analyzeStrength, strengthBarClass, strengthDotClass, strengthTextClass } from "@/lib/security/strength";
import { cn } from "@/lib/utils";

type Mode = "password" | "passphrase";

type HistoryItem = {
  id: string;
  value: string;
  createdAt: number;
  score: number;
  mode: Mode;
};

function relativeTime(createdAt: number) {
  const delta = Date.now() - createdAt;
  if (delta < 60_000) return "just now";
  const minutes = Math.floor(delta / 60_000);
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.floor(minutes / 60)} hr ago`;
}

function OptionRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-3">
      <span className="text-sm text-ink">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--coral)]"
      />
    </label>
  );
}

function StrengthMeter({ value }: { value: string }) {
  const strength = useMemo(() => analyzeStrength(value), [value]);
  return (
    <div className="space-y-2">
      <div className="flex gap-1" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={4} aria-valuenow={strength.score} aria-valuetext={strength.label}>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={cn("h-2 flex-1 rounded-full", strengthBarClass(strength.score, index <= strength.score))} />
        ))}
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className={cn("text-sm font-semibold", strengthTextClass(strength.score))}>Strength: {strength.label}</p>
        <p className="text-xs text-[var(--muted-ink)]">Time to crack: {strength.crackTime}</p>
      </div>
    </div>
  );
}

export function PasswordGenerator() {
  const [mode, setMode] = useState<Mode>("password");
  const [passwordOptions, setPasswordOptions] = useState<PasswordOptions>(DEFAULT_PASSWORD_OPTIONS);
  const [passphraseOptions, setPassphraseOptions] = useState<PassphraseOptions>(DEFAULT_PASSPHRASE_OPTIONS);
  const [bulk, setBulk] = useState(1);
  const [results, setResults] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const current = results[0] ?? "";
  const currentStrength = useMemo(() => (current ? analyzeStrength(current) : null), [current]);

  const pushHistory = useCallback((values: string[], nextMode: Mode) => {
    const items: HistoryItem[] = values.map((value) => ({
      id: sessionId(),
      value,
      createdAt: Date.now(),
      score: analyzeStrength(value).score,
      mode: nextMode,
    }));
    setHistory((prev) => [...items, ...prev].slice(0, 10));
  }, []);

  const generate = useCallback(() => {
    try {
      const count = clampBulkCount(bulk);
      if (mode === "password") {
        const result = generatePasswords(passwordOptions, count);
        if (!result.ok) {
          setError(result.message);
          setResults([]);
          return;
        }
        const values = result.passwords ?? [result.password];
        setResults(values);
        pushHistory(values, "password");
        setError("");
        return;
      }

      const values = generatePassphrases(passphraseOptions, count);
      setResults(values);
      pushHistory(values, "passphrase");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate passwords.");
      setResults([]);
    }
  }, [bulk, mode, passphraseOptions, passwordOptions, pushHistory]);

  const copyValue = async (value: string, key: string) => {
    const ok = await copyText(value);
    if (!ok) {
      toast.error("Unable to copy automatically. Please copy the password manually.");
      return;
    }
    setCopiedKey(key);
    toast.success("Copied!");
    window.setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1500);
  };

  const copyAll = async () => {
    if (!results.length) return;
    await copyValue(results.join("\n"), "all");
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="inline-flex w-full rounded-xl border border-[var(--hairline)] bg-canvas p-1" role="tablist" aria-label="Generator mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "password"}
          className={cn(
            "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            mode === "password" ? "bg-primary text-primary-foreground" : "text-[var(--muted-ink)] hover:text-ink",
          )}
          onClick={() => setMode("password")}
        >
          <KeyRound className="h-4 w-4" />
          Password
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "passphrase"}
          className={cn(
            "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            mode === "passphrase" ? "bg-primary text-primary-foreground" : "text-[var(--muted-ink)] hover:text-ink",
          )}
          onClick={() => setMode("passphrase")}
        >
          <MessageSquareText className="h-4 w-4" />
          Passphrase
        </button>
      </div>

      {current ? (
        <div className="rounded-xl border border-[var(--hairline)] bg-surface-soft p-5">
          <div className="flex items-start gap-3">
            <code className="min-w-0 flex-1 break-all font-mono text-lg text-ink sm:text-xl">{current}</code>
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="outline" className="h-11 min-h-11 w-11 p-0" aria-label="Copy password" onClick={() => void copyValue(current, "primary")}>
                {copiedKey === "primary" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button type="button" variant="outline" className="h-11 min-h-11 w-11 p-0" aria-label="Regenerate" onClick={generate}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-ink)]">
            {mode === "password" ? `${current.length} characters` : `${passphraseOptions.wordCount} words`}
          </p>
          {currentStrength ? <div className="mt-3"><StrengthMeter value={current} /></div> : null}
        </div>
      ) : null}

      {results.length > 1 ? (
        <div className="space-y-2 rounded-xl border border-[var(--hairline)] bg-canvas p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">Generated list ({results.length})</p>
            <Button type="button" size="sm" variant="outline" onClick={() => void copyAll()}>
              {copiedKey === "all" ? "Copied" : "Copy all"}
            </Button>
          </div>
          <ul className="space-y-2">
            {results.map((value, index) => (
              <li key={`${value}-${index}`} className="flex items-center gap-3 rounded-lg border border-[var(--hairline)] bg-surface-soft px-3 py-2">
                <code className="min-w-0 flex-1 break-all font-mono text-sm">{value}</code>
                <Button type="button" size="sm" variant="ghost" onClick={() => void copyValue(value, `result-${index}`)}>
                  {copiedKey === `result-${index}` ? "Copied" : "Copy"}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {mode === "password" ? (
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <Label htmlFor="password-length">Password Length: {passwordOptions.length}</Label>
            </div>
            <Slider
              id="password-length"
              className="min-h-11"
              min={PASSWORD_LIMITS.minLength}
              max={PASSWORD_LIMITS.maxLength}
              step={1}
              value={[passwordOptions.length]}
              onValueChange={([value]) => setPasswordOptions((prev) => ({ ...prev, length: value }))}
              aria-label="Password length"
            />
            <div className="mt-1 flex justify-between text-xs text-[var(--muted-ink)]">
              <span>{PASSWORD_LIMITS.minLength}</span>
              <span>{PASSWORD_LIMITS.maxLength}</span>
            </div>
          </div>

          <div className="space-y-2">
            <OptionRow label="Uppercase (A-Z)" checked={passwordOptions.uppercase} onChange={(checked) => setPasswordOptions((prev) => ({ ...prev, uppercase: checked }))} />
            <OptionRow label="Lowercase (a-z)" checked={passwordOptions.lowercase} onChange={(checked) => setPasswordOptions((prev) => ({ ...prev, lowercase: checked }))} />
            <OptionRow label="Numbers (0-9)" checked={passwordOptions.numbers} onChange={(checked) => setPasswordOptions((prev) => ({ ...prev, numbers: checked }))} />
            <OptionRow label="Symbols (!@#$%^&*)" checked={passwordOptions.symbols} onChange={(checked) => setPasswordOptions((prev) => ({ ...prev, symbols: checked }))} />
            <OptionRow
              label="Exclude ambiguous characters (0, O, o, l, 1, I, |)"
              checked={passwordOptions.excludeAmbiguous}
              onChange={(checked) => setPasswordOptions((prev) => ({ ...prev, excludeAmbiguous: checked }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="min-numbers">Minimum numbers (1-5)</Label>
              <Input
                id="min-numbers"
                type="number"
                min={1}
                max={5}
                className="mt-1 h-11"
                value={passwordOptions.minNumbers}
                disabled={!passwordOptions.numbers}
                onChange={(event) =>
                  setPasswordOptions((prev) => ({
                    ...prev,
                    minNumbers: clampRequiredCount(Number(event.target.value) || 0),
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="min-symbols">Minimum symbols (1-5)</Label>
              <Input
                id="min-symbols"
                type="number"
                min={1}
                max={5}
                className="mt-1 h-11"
                value={passwordOptions.minSymbols}
                disabled={!passwordOptions.symbols}
                onChange={(event) =>
                  setPasswordOptions((prev) => ({
                    ...prev,
                    minSymbols: clampRequiredCount(Number(event.target.value) || 0),
                  }))
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <Label htmlFor="word-count">Word Count: {passphraseOptions.wordCount}</Label>
            </div>
            <Slider
              id="word-count"
              className="min-h-11"
              min={PASSPHRASE_LIMITS.minWords}
              max={PASSPHRASE_LIMITS.maxWords}
              step={1}
              value={[passphraseOptions.wordCount]}
              onValueChange={([value]) => setPassphraseOptions((prev) => ({ ...prev, wordCount: value }))}
              aria-label="Passphrase word count"
            />
            <div className="mt-1 flex justify-between text-xs text-[var(--muted-ink)]">
              <span>{PASSPHRASE_LIMITS.minWords}</span>
              <span>{PASSPHRASE_LIMITS.maxWords}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="separator">Separator</Label>
            <select
              id="separator"
              className="mt-1 flex h-11 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink"
              value={passphraseOptions.separator}
              onChange={(event) =>
                setPassphraseOptions((prev) => ({
                  ...prev,
                  separator: event.target.value as PassphraseSeparator,
                }))
              }
            >
              {PASSPHRASE_SEPARATORS.map((item) => (
                <option key={item.label} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <OptionRow
            label="Capitalize first letter of each word"
            checked={passphraseOptions.capitalize}
            onChange={(checked) => setPassphraseOptions((prev) => ({ ...prev, capitalize: checked }))}
          />
          <OptionRow
            label="Include number at end (e.g. -42)"
            checked={passphraseOptions.includeNumber}
            onChange={(checked) => setPassphraseOptions((prev) => ({ ...prev, includeNumber: checked }))}
          />
        </div>
      )}

      <div>
        <Label htmlFor="bulk-count">Generate multiple (1-20)</Label>
        <Input
          id="bulk-count"
          type="number"
          min={1}
          max={20}
          className="mt-1 h-11"
          value={bulk}
          onChange={(event) => setBulk(clampBulkCount(Number(event.target.value) || 1))}
          onBlur={() => setBulk((value) => clampBulkCount(value))}
        />
      </div>

      {error ? (
        <p className="text-sm text-[var(--body)]" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="button" className="h-11 min-h-11 w-full" onClick={generate}>
        {mode === "password" ? "Generate Password" : "Generate Passphrase"}
      </Button>

      <div className="overflow-hidden rounded-xl border border-[var(--hairline)] bg-canvas">
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium"
          aria-expanded={historyOpen}
          onClick={() => setHistoryOpen((open) => !open)}
        >
          <span>History ({history.length})</span>
          <ChevronDown className={cn("h-5 w-5 text-[var(--muted-ink)] transition-transform", historyOpen && "rotate-180")} />
        </button>
        {historyOpen ? (
          <div className="border-t border-[var(--hairline)] px-4 py-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs text-[var(--muted-ink)]">
                History is stored in memory only and cleared when you close or refresh this page.
              </p>
              {history.length > 0 ? (
                <button type="button" className="shrink-0 text-xs text-[var(--muted-ink)] hover:text-ink" onClick={() => setHistory([])}>
                  Clear history
                </button>
              ) : null}
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-[var(--muted-ink)]">No generations yet this session.</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg border border-[var(--hairline)] bg-surface-soft p-5">
                    <span className={cn("inline-block h-2.5 w-2.5 shrink-0 rounded-full", strengthDotClass(item.score))} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <code className="block break-all font-mono text-sm text-ink">{item.value}</code>
                      <p className="mt-1 text-xs text-[var(--muted-ink)]">
                        {relativeTime(item.createdAt)} · {item.mode === "password" ? "Password" : "Passphrase"}
                      </p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={() => void copyValue(item.value, item.id)}>
                      {copiedKey === item.id ? "Copied" : "Copy"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-[var(--hairline)] bg-surface-soft p-3 text-sm leading-6 text-[var(--body)]">
        <p className="font-medium text-ink">How it works</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Choose password or passphrase mode.</li>
          <li>Generate secure output with browser crypto randomness.</li>
          <li>Review strength and copy instantly. Nothing is uploaded.</li>
        </ol>
      </div>
    </div>
  );
}
