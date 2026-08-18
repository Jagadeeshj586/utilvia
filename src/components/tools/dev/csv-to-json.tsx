"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  convertCsvToJson,
  DEFAULT_CSV_INPUT,
  DELIMITER_OPTIONS,
  type CsvDelimiter,
} from "@/lib/csv/convert";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

export function CsvToJsonTool() {
  const [csv, setCsv] = useState(DEFAULT_CSV_INPUT);
  const [delimiter, setDelimiter] = useState<CsvDelimiter>("auto");
  const [headerRow, setHeaderRow] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [view, setView] = useState<"json" | "table">("json");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const result = useMemo(
    () =>
      convertCsvToJson(csv, {
        delimiter,
        headerRow,
        trimWhitespace,
      }),
    [csv, delimiter, headerRow, trimWhitespace],
  );

  const onCopy = async () => {
    if (!result.json) return;
    const ok = await copyText(result.json);
    if (ok) {
      setCopied(true);
      toast.success("JSON copied");
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Could not copy JSON");
    }
  };

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsv(text);
    event.target.value = "";
    toast.success(`Loaded ${file.name}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Delimiter:</span>
          {DELIMITER_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setDelimiter(option.id)}
              className={cn(
                "min-h-10 rounded-lg border px-3 py-1.5 font-mono text-sm transition-colors",
                delimiter === option.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[var(--hairline)] bg-surface-soft text-ink hover:border-primary/40",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--body)]">
          <input
            type="checkbox"
            checked={headerRow}
            onChange={(event) => setHeaderRow(event.target.checked)}
            className="h-4 w-4 rounded border-[var(--hairline)]"
          />
          First row is header
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--body)]">
          <input
            type="checkbox"
            checked={trimWhitespace}
            onChange={(event) => setTrimWhitespace(event.target.checked)}
            className="h-4 w-4 rounded border-[var(--hairline)]"
          />
          Trim whitespace
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="csv-input">CSV Input</Label>
            <div>
              <input ref={fileRef} type="file" accept=".csv,text/csv,text/plain" className="hidden" onChange={onUpload} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV file
              </Button>
            </div>
          </div>
          <Textarea
            id="csv-input"
            value={csv}
            onChange={(event) => setCsv(event.target.value)}
            spellCheck={false}
            className="min-h-[320px] font-mono text-sm leading-relaxed"
            placeholder={DEFAULT_CSV_INPUT}
          />
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <Tabs value={view} onValueChange={(value) => setView(value as "json" | "table")}>
              <TabsList className="flex h-auto w-auto justify-start gap-1 rounded-none bg-transparent p-0">
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="table">Table Preview</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button type="button" variant="outline" size="sm" disabled={!result.json} onClick={() => void onCopy()}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          {view === "json" ? (
            <Textarea
              readOnly
              value={result.json}
              className="min-h-[320px] font-mono text-sm leading-relaxed"
              aria-label="JSON output"
            />
          ) : (
            <div className="min-h-[320px] overflow-auto rounded-lg border border-[var(--hairline)] bg-surface-soft">
              {result.rows.length ? (
                <table className="min-w-full text-left text-sm">
                  <thead className="sticky top-0 bg-canvas">
                    <tr>
                      {result.headers.map((header) => (
                        <th key={header} className="border-b border-[var(--hairline)] px-3 py-2 font-medium text-ink">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-[var(--hairline)] last:border-b-0">
                        {result.headers.map((header) => (
                          <td key={`${rowIndex}-${header}`} className="px-3 py-2 font-mono text-[var(--body)]">
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">No rows to preview.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {result.error ? (
        <p className="text-sm text-destructive" role="alert">
          {result.error}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {result.rowCount} rows · {result.columnCount} columns
          {headerRow ? ` · ${result.headers.length} headers` : ""}
          {delimiter === "auto" && result.json
            ? ` · delimiter ${result.detectedDelimiter === "\t" ? "Tab" : result.detectedDelimiter}`
            : ""}
        </p>
      )}
    </div>
  );
}
