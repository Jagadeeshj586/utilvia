"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Dropzone } from "@/components/tools/dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_JSON_INPUT,
  convertJsonToCsv,
  csvFileName,
  suggestedCsvName,
} from "@/lib/json-to-csv/convert";
import { copyText } from "@/lib/security/clipboard";
import { cn, downloadText } from "@/lib/utils";

const PREVIEW_ROWS = 150;

export function JsonToCsvTool() {
  const [json, setJson] = useState(DEFAULT_JSON_INPUT);
  const [fileName, setFileName] = useState("data.csv");
  const [files, setFiles] = useState<File[]>([]);
  const [copied, setCopied] = useState(false);
  const [mobileView, setMobileView] = useState<"input" | "output">("input");
  const [outputTab, setOutputTab] = useState<"csv" | "table">("table");

  const result = useMemo(() => convertJsonToCsv(json), [json]);
  const previewRows = result.rows.slice(0, PREVIEW_ROWS);
  const hasOutput = Boolean(result.csv) && !result.error;
  const downloadName = csvFileName(fileName);

  const onCopy = async () => {
    if (!hasOutput) return;
    const ok = await copyText(result.csv);
    if (!ok) {
      toast.error("Could not copy CSV");
      return;
    }
    setCopied(true);
    toast.success("CSV copied");
    window.setTimeout(() => setCopied(false), 1600);
  };

  const onDownload = () => {
    if (!hasOutput) return;
    downloadText(`\uFEFF${result.csv}`, downloadName, "text/csv;charset=utf-8");
    toast.success(`Downloading ${downloadName}`);
  };

  const onReset = () => {
    setJson(DEFAULT_JSON_INPUT);
    setFileName("data.csv");
    setFiles([]);
    setCopied(false);
    setMobileView("input");
    setOutputTab("table");
  };

  const onFiles = async (next: File[]) => {
    const file = next[0];
    if (!file) {
      setFiles([]);
      return;
    }
    const lower = file.name.toLowerCase();
    if (file.type.startsWith("image/") || file.type.startsWith("application/pdf") || file.type.startsWith("video/")) {
      toast.error("Use a .json text file.");
      return;
    }
    if (file.name.includes(".") && !lower.endsWith(".json") && !lower.endsWith(".txt")) {
      toast.error("Use a .json file.");
      return;
    }
    try {
      const text = await file.text();
      setFiles([file]);
      setJson(text);
      setFileName(suggestedCsvName(file.name));
      setMobileView("output");
      toast.success(`Loaded ${file.name}`);
    } catch {
      toast.error("Could not read that file.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Button type="button" className="min-h-10 min-w-28 px-6" disabled={!hasOutput} onClick={() => void onCopy()}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy CSV"}
        </Button>
        <Button type="button" variant="outline" className="min-h-10" disabled={!hasOutput} onClick={onDownload}>
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
        <Button type="button" variant="outline" className="min-h-10" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <Label htmlFor="json-csv-filename">Download file name</Label>
          <Input
            id="json-csv-filename"
            value={fileName}
            className="mt-1 font-mono text-sm"
            spellCheck={false}
            onChange={(event) => setFileName(event.target.value)}
          />
        </div>
        <p className="text-xs text-[var(--muted-ink)] sm:pb-2">Saves as {downloadName}</p>
      </div>

      <div className="flex lg:hidden">
        <div className="flex w-full gap-2" role="tablist" aria-label="Editor view">
          {(
            [
              { id: "input" as const, label: "JSON input" },
              { id: "output" as const, label: "CSV output" },
            ]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={mobileView === item.id}
              className={cn(
                "min-h-10 flex-1 rounded-lg border px-3 text-sm font-medium transition-colors",
                mobileView === item.id
                  ? "border-coral bg-coral text-white"
                  : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
              )}
              onClick={() => setMobileView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {result.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {result.error}
        </p>
      ) : json.trim() ? (
        <p className="text-sm text-[var(--body)]">
          {result.rowCount.toLocaleString("en-US")} rows · {result.columnCount.toLocaleString("en-US")} columns
          {result.note ? ` · ${result.note}` : ""}
        </p>
      ) : (
        <p className="text-sm text-[var(--muted-ink)]">Paste JSON or drop a .json file to convert.</p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cn(mobileView === "output" && "max-lg:hidden")}>
          <Label htmlFor="json-csv-input">JSON</Label>
          <Textarea
            id="json-csv-input"
            value={json}
            spellCheck={false}
            aria-invalid={Boolean(result.error)}
            className="mt-2 min-h-[280px] font-mono text-xs leading-relaxed sm:min-h-[360px] sm:text-sm"
            placeholder='[{"name":"Ada","role":"Engineer"}]'
            onChange={(event) => setJson(event.target.value)}
          />
          <div className="mt-3">
            <Dropzone
              accept=".json,application/json,text/plain"
              maxSizeMB={5}
              files={files}
              onFiles={(next) => void onFiles(next)}
              onRemove={() => setFiles([])}
              compact
              label="Drop a .json file or choose one"
              hint="Max 5 MB. Conversion stays in your browser."
            />
          </div>
        </div>

        <div className={cn("space-y-2", mobileView === "input" && "max-lg:hidden")}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink">CSV</p>
            <div className="flex gap-2" role="tablist" aria-label="CSV view">
              {(
                [
                  { id: "table" as const, label: "Table preview" },
                  { id: "csv" as const, label: "CSV text" },
                ]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={outputTab === item.id}
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                    outputTab === item.id
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => setOutputTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {outputTab === "csv" ? (
            <Textarea
              readOnly
              value={hasOutput ? result.csv : ""}
              aria-label="CSV output"
              className="min-h-[280px] font-mono text-xs leading-relaxed sm:min-h-[360px] sm:text-sm"
              placeholder="CSV appears here when the JSON is valid."
            />
          ) : (
            <div className="min-h-[280px] overflow-auto rounded-lg border border-[var(--hairline)] bg-canvas sm:min-h-[360px]">
              {hasOutput ? (
                <table className="min-w-full text-left text-sm">
                  <caption className="sr-only">CSV table preview</caption>
                  <thead className="sticky top-0 bg-surface-soft">
                    <tr>
                      {result.headers.map((header) => (
                        <th key={header} className="whitespace-nowrap border-b border-[var(--hairline)] px-3 py-2 font-medium text-ink">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-[var(--hairline)] last:border-b-0">
                        {result.headers.map((header) => (
                          <td key={`${rowIndex}-${header}`} className="max-w-[16rem] truncate px-3 py-2 font-mono text-xs text-[var(--body)]" title={row[header]}>
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-10 text-center text-sm text-[var(--muted-ink)]">
                  {result.error ? "Fix the JSON to see a preview." : "No rows to preview."}
                </p>
              )}
            </div>
          )}
          {hasOutput && result.rowCount > PREVIEW_ROWS ? (
            <p className="text-xs text-[var(--muted-ink)]">
              Table shows the first {PREVIEW_ROWS.toLocaleString("en-US")} rows. Copy or download for the full CSV.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
