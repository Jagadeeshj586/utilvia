"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ROBOTS_PRESETS,
  USER_AGENT_SUGGESTIONS,
  cloneDraft,
  emptyGroup,
  generateRobotsTxt,
  newGroupId,
  newRuleId,
  type AgentGroup,
  type PathKind,
  type RobotsDraft,
} from "@/lib/robots-txt/generate";
import { copyText } from "@/lib/security/clipboard";
import { cn, downloadText } from "@/lib/utils";

export function RobotsTxtGenerator() {
  const [draft, setDraft] = useState<RobotsDraft>(() => cloneDraft());
  const [presetId, setPresetId] = useState("seo");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => generateRobotsTxt(draft), [draft]);
  const canExport = Boolean(result.text) && result.status !== "error";

  const setGroup = (id: string, patch: Partial<AgentGroup>) => {
    setPresetId("custom");
    setDraft((current) => ({
      ...current,
      groups: current.groups.map((group) => (group.id === id ? { ...group, ...patch } : group)),
    }));
  };

  const applyPreset = (id: string) => {
    const preset = ROBOTS_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setPresetId(id);
    setDraft(cloneDraft(preset.draft));
    setCopied(false);
  };

  const copy = async () => {
    if (!canExport) return;
    const ok = await copyText(result.text);
    if (!ok) {
      toast.error("Could not copy");
      return;
    }
    setCopied(true);
    toast.success("Copied robots.txt");
    window.setTimeout(() => setCopied(false), 1600);
  };

  const download = () => {
    if (!canExport) return;
    downloadText(result.text, "robots.txt", "text/plain;charset=utf-8");
    toast.success("Downloading robots.txt");
  };

  const reset = () => applyPreset("seo");

  const statusLabel =
    result.status === "valid" ? "Valid robots.txt" : result.status === "warning" ? "Valid, with notes" : "Needs a fix";

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted-ink)]">Configure rules, preview the file as you type, then copy or download.</p>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Configure</p>
            <p className="mt-3 text-sm font-medium text-ink">Presets</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ROBOTS_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.hint}
                  aria-pressed={presetId === preset.id}
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                    presetId === preset.id
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => applyPreset(preset.id)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {draft.groups.map((group, index) => (
              <AgentGroupCard
                key={group.id}
                index={index}
                group={group}
                canRemove={draft.groups.length > 1}
                onChange={(patch) => setGroup(group.id, patch)}
                onRemove={() => {
                  setPresetId("custom");
                  setDraft((current) => ({ ...current, groups: current.groups.filter((item) => item.id !== group.id) }));
                }}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              className="min-h-10"
              onClick={() => {
                setPresetId("custom");
                setDraft((current) => ({
                  ...current,
                  groups: [...current.groups, emptyGroup(newGroupId(current.groups))],
                }));
              }}
            >
              <Plus className="h-4 w-4" />
              Add user-agent
            </Button>
          </div>

          <div>
            <Label>Sitemap URLs</Label>
            <p className="mt-1 text-xs text-[var(--muted-ink)]">Optional. Each must be an absolute http(s) URL.</p>
            <div className="mt-2 space-y-2">
              {draft.sitemaps.map((sitemap, index) => (
                <div key={`sitemap-${index}`} className="flex gap-2">
                  <Input
                    value={sitemap}
                    spellCheck={false}
                    placeholder="https://example.com/sitemap.xml"
                    className="min-h-10 font-mono text-sm"
                    aria-label={`Sitemap URL ${index + 1}`}
                    onChange={(event) => {
                      setPresetId("custom");
                      const value = event.target.value;
                      setDraft((current) => {
                        const sitemaps = [...current.sitemaps];
                        sitemaps[index] = value;
                        return { ...current, sitemaps };
                      });
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-10 shrink-0"
                    aria-label={`Remove sitemap ${index + 1}`}
                    disabled={draft.sitemaps.length <= 1}
                    onClick={() => {
                      setPresetId("custom");
                      setDraft((current) => ({
                        ...current,
                        sitemaps: current.sitemaps.filter((_, itemIndex) => itemIndex !== index),
                      }));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-2 min-h-10"
              onClick={() => {
                setPresetId("custom");
                setDraft((current) => ({ ...current, sitemaps: [...current.sitemaps, ""] }));
              }}
            >
              <Plus className="h-4 w-4" />
              Add sitemap
            </Button>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5 lg:sticky lg:top-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Preview</p>
              <p
                className={cn(
                  "mt-2 inline-flex min-h-8 items-center rounded-md border px-2.5 text-xs font-medium",
                  result.status === "valid" && "border-teal/40 bg-teal/10 text-teal",
                  result.status === "warning" && "border-[#e8a55a]/50 bg-[#e8a55a]/15 text-ink",
                  result.status === "error" && "border-coral/40 bg-coral/10 text-coral",
                )}
              >
                {statusLabel}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" className="min-h-10" disabled={!canExport} onClick={() => void copy()}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button type="button" variant="outline" className="min-h-10" disabled={!canExport} onClick={download}>
                <Download className="h-4 w-4" />
                Download robots.txt
              </Button>
              <Button type="button" variant="outline" className="min-h-10" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {result.issues.length ? (
            <ul className="space-y-1.5 text-sm" aria-live="polite">
              {result.issues.map((issue, index) => (
                <li
                  key={`${issue.level}-${index}`}
                  className={cn(
                    issue.level === "error" && "text-destructive",
                    issue.level === "warning" && "text-ink",
                    issue.level === "info" && "text-[var(--muted-ink)]",
                  )}
                >
                  {issue.level === "error" ? "Error: " : issue.level === "warning" ? "Note: " : ""}
                  {issue.message}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--muted-ink)]">Syntax looks good. Serve this file at /robots.txt.</p>
          )}

          <Textarea
            readOnly
            value={result.text || "# Add a user-agent group to generate robots.txt"}
            className="min-h-[280px] font-mono text-sm"
            aria-label="Generated robots.txt"
          />
        </div>
      </div>
    </div>
  );
}

function AgentGroupCard({
  group,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  group: AgentGroup;
  index: number;
  canRemove: boolean;
  onChange: (patch: Partial<AgentGroup>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-[var(--hairline)] bg-canvas p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink">User-agent {index + 1}</p>
        <Button type="button" variant="ghost" className="h-8 px-2" disabled={!canRemove} onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove user-agent {index + 1}</span>
        </Button>
      </div>

      <div>
        <Label htmlFor={`${group.id}-ua`}>Crawler</Label>
        <Input
          id={`${group.id}-ua`}
          value={group.userAgent}
          spellCheck={false}
          className="mt-1 min-h-10 font-mono"
          placeholder="*"
          onChange={(event) => onChange({ userAgent: event.target.value })}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {USER_AGENT_SUGGESTIONS.map((agent) => (
            <button
              key={agent}
              type="button"
              className={cn(
                "min-h-8 rounded-md border px-2 font-mono text-xs",
                group.userAgent === agent
                  ? "border-coral bg-coral text-white"
                  : "border-[var(--hairline)] bg-surface-card text-ink hover:border-coral/40",
              )}
              onClick={() => onChange({ userAgent: agent })}
            >
              {agent}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-ink">Allow / Disallow</p>
        {group.rules.map((rule) => (
          <div key={rule.id} className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor={`${rule.id}-kind`}>
              Rule type
            </label>
            <select
              id={`${rule.id}-kind`}
              value={rule.kind}
              className="h-10 rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary sm:w-[8.5rem]"
              onChange={(event) =>
                onChange({
                  rules: group.rules.map((item) =>
                    item.id === rule.id ? { ...item, kind: event.target.value as PathKind } : item,
                  ),
                })
              }
            >
              <option value="allow">Allow</option>
              <option value="disallow">Disallow</option>
            </select>
            <Input
              value={rule.path}
              spellCheck={false}
              placeholder="/admin"
              className="min-h-10 font-mono text-sm"
              aria-label={`${rule.kind} path`}
              onChange={(event) =>
                onChange({
                  rules: group.rules.map((item) => (item.id === rule.id ? { ...item, path: event.target.value } : item)),
                })
              }
            />
            <Button
              type="button"
              variant="outline"
              className="min-h-10 shrink-0"
              aria-label="Remove path"
              disabled={group.rules.length <= 1}
              onClick={() => onChange({ rules: group.rules.filter((item) => item.id !== rule.id) })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="min-h-10"
          onClick={() =>
            onChange({
              rules: [...group.rules, { id: newRuleId(group.rules), kind: "disallow", path: "" }],
            })
          }
        >
          <Plus className="h-4 w-4" />
          Add path
        </Button>
      </div>

      <div>
        <Label htmlFor={`${group.id}-delay`}>Crawl-delay (optional)</Label>
        <Input
          id={`${group.id}-delay`}
          inputMode="decimal"
          value={group.crawlDelay}
          placeholder="Ignored by Google"
          className="mt-1 min-h-10 font-mono"
          onChange={(event) => {
            const value = event.target.value;
            if (value === "" || /^\d*\.?\d*$/.test(value)) onChange({ crawlDelay: value });
          }}
        />
      </div>
    </div>
  );
}
