"use client";

import { useMemo, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  GripVertical,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { convertMarkdown } from "@/lib/markdown/convert";
import {
  MD_TABLE_DEFAULT,
  MD_TABLE_LIMITS,
  MD_TABLE_TEMPLATES,
  addColumn,
  addRow,
  cloneTable,
  generateMarkdown,
  moveColumn,
  moveRow,
  parseMarkdownTable,
  removeColumn,
  removeRow,
  resizeTable,
  type ColumnAlign,
  type MarkdownTableState,
} from "@/lib/markdown-table/generate";
import { copyText } from "@/lib/security/clipboard";
import { cn, downloadText } from "@/lib/utils";

type View = "editor" | "markdown" | "preview";

const previewClassName =
  "overflow-auto rounded-lg border border-[var(--hairline)] bg-surface-soft p-4 text-sm leading-relaxed text-[var(--body)] [&_code]:rounded [&_code]:bg-canvas [&_code]:px-1 [&_strong]:font-semibold [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[var(--hairline)] [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-[var(--hairline)] [&_th]:bg-canvas [&_th]:px-3 [&_th]:py-2 [&_th]:font-medium";

export function MarkdownTableGenerator() {
  const [table, setTable] = useState<MarkdownTableState>(MD_TABLE_DEFAULT);
  const [view, setView] = useState<View>("editor");
  const [copied, setCopied] = useState(false);
  const [markdownDraft, setMarkdownDraft] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ kind: "row" | "col"; index: number } | null>(null);

  const markdown = useMemo(() => generateMarkdown(table), [table]);
  const output = markdownDraft ?? markdown;
  const previewHtml = useMemo(() => convertMarkdown(output).html, [output]);

  const applyMarkdown = (value: string) => {
    setMarkdownDraft(value);
    const parsed = parseMarkdownTable(value);
    if (!parsed) {
      setParseError("That does not look like a Markdown table yet. Keep the leading and trailing pipes.");
      return;
    }
    setParseError(null);
    setTable(parsed);
  };

  const copyMarkdown = async () => {
    const ok = await copyText(output);
    if (!ok) {
      toast.error("Could not copy");
      return;
    }
    setCopied(true);
    toast.success("Markdown copied");
    window.setTimeout(() => setCopied(false), 1600);
  };

  const reset = () => {
    setTable(cloneTable(MD_TABLE_DEFAULT));
    setMarkdownDraft(null);
    setParseError(null);
    setView("editor");
    toast.success("Table reset");
  };

  const setHeader = (index: number, value: string) => {
    setMarkdownDraft(null);
    setTable((current) => {
      const next = { ...current, headers: [...current.headers] };
      next.headers[index] = value;
      return next;
    });
  };

  const setCell = (row: number, col: number, value: string) => {
    setMarkdownDraft(null);
    setTable((current) => {
      const next = { ...current, rows: current.rows.map((item) => [...item]) };
      next.rows[row][col] = value;
      return next;
    });
  };

  const setAlign = (index: number, align: ColumnAlign) => {
    setMarkdownDraft(null);
    setTable((current) => {
      const next = { ...current, alignments: [...current.alignments] };
      next.alignments[index] = align;
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Table views">
          {(
            [
              ["editor", "Editor"],
              ["markdown", "Markdown"],
              ["preview", "Preview"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              className={cn(
                "min-h-10 rounded-lg border px-4 text-sm font-medium transition-colors",
                view === id
                  ? "border-coral bg-coral text-white"
                  : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
              )}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void copyMarkdown()} disabled={!output}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy Markdown"}
          </Button>
          <Button type="button" variant="outline" onClick={() => downloadText(output, "table.md", "text/markdown")}>
            <Download className="h-4 w-4" />
            Download .md
          </Button>
          <Button type="button" variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {MD_TABLE_TEMPLATES.map((item) => (
          <button
            key={item.id}
            type="button"
            className="rounded-full border border-[var(--hairline)] bg-canvas px-3 py-1.5 text-sm text-ink hover:border-coral/40"
            onClick={() => {
              setTable(cloneTable(item.state));
              setMarkdownDraft(null);
              setParseError(null);
              setView("editor");
            }}
          >
            {item.label}
            <span className="ml-1 text-[var(--muted-ink)]">· {item.hint}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4">
        <NumberField
          id="md-cols"
          label="Columns"
          value={table.headers.length}
          min={MD_TABLE_LIMITS.minCols}
          max={MD_TABLE_LIMITS.maxCols}
          onChange={(cols) => {
            setMarkdownDraft(null);
            setTable((current) => resizeTable(current, current.rows.length, cols));
          }}
        />
        <NumberField
          id="md-rows"
          label="Rows"
          value={table.rows.length}
          min={MD_TABLE_LIMITS.minRows}
          max={MD_TABLE_LIMITS.maxRows}
          onChange={(rows) => {
            setMarkdownDraft(null);
            setTable((current) => resizeTable(current, rows, current.headers.length));
          }}
        />
        <label className="flex min-h-10 items-center gap-2 text-sm">
          <Switch
            checked={table.includeHeader}
            onCheckedChange={(checked) => {
              setMarkdownDraft(null);
              setTable((current) => ({ ...current, includeHeader: checked }));
            }}
          />
          Header row
        </label>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={table.rows.length >= MD_TABLE_LIMITS.maxRows}
            onClick={() => {
              setMarkdownDraft(null);
              setTable((current) => addRow(current));
            }}
          >
            <Plus className="h-4 w-4" />
            Row
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={table.headers.length >= MD_TABLE_LIMITS.maxCols}
            onClick={() => {
              setMarkdownDraft(null);
              setTable((current) => addColumn(current));
            }}
          >
            <Plus className="h-4 w-4" />
            Column
          </Button>
        </div>
      </div>

      {view === "editor" ? (
        <div className="overflow-x-auto rounded-xl border border-[var(--hairline)] bg-canvas">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-12 border-b border-[var(--hairline)] bg-surface-soft p-2" />
                {table.headers.map((header, col) => (
                  <th key={col} className="min-w-[10rem] border-b border-l border-[var(--hairline)] bg-surface-soft p-2 align-top">
                    <div
                      className="mb-2 hidden items-center justify-between gap-1 sm:flex"
                      draggable
                      onDragStart={() => setDrag({ kind: "col", index: col })}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (drag?.kind === "col") {
                          setMarkdownDraft(null);
                          setTable((current) => moveColumn(current, drag.index, col));
                        }
                        setDrag(null);
                      }}
                    >
                      <span className="inline-flex cursor-grab items-center gap-1 text-xs text-[var(--muted-ink)]">
                        <GripVertical className="h-3.5 w-3.5" />
                        Col {col + 1}
                      </span>
                      {table.headers.length > 1 ? (
                        <button
                          type="button"
                          className="text-[var(--muted-ink)] hover:text-[var(--error)]"
                          aria-label={`Remove column ${col + 1}`}
                          onClick={() => {
                            setMarkdownDraft(null);
                            setTable((current) => removeColumn(current, col));
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                    <div className="mb-2 flex justify-center gap-1" role="group" aria-label={`Column ${col + 1} alignment`}>
                      {(
                        [
                          ["left", AlignLeft],
                          ["center", AlignCenter],
                          ["right", AlignRight],
                        ] as const
                      ).map(([align, Icon]) => (
                        <button
                          key={align}
                          type="button"
                          aria-pressed={table.alignments[col] === align}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-md border",
                            table.alignments[col] === align
                              ? "border-coral bg-coral text-white"
                              : "border-[var(--hairline)] bg-canvas text-[var(--muted-ink)] hover:border-coral/40",
                          )}
                          onClick={() => setAlign(col, align)}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="sr-only">{align}</span>
                        </button>
                      ))}
                    </div>
                    {table.includeHeader ? (
                      <Input
                        value={header}
                        aria-label={`Header ${col + 1}`}
                        className="h-9 bg-canvas"
                        onChange={(event) => setHeader(col, event.target.value)}
                      />
                    ) : (
                      <p className="py-2 text-center text-xs text-[var(--muted-ink)]">No header</p>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <th className="border-b border-[var(--hairline)] bg-surface-soft p-1 align-middle">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] text-[var(--muted-ink)]">{rowIndex + 1}</span>
                      <div
                        className="hidden cursor-grab text-[var(--muted-ink)] sm:block"
                        draggable
                        aria-label={`Drag row ${rowIndex + 1}`}
                        onDragStart={() => setDrag({ kind: "row", index: rowIndex })}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          if (drag?.kind === "row") {
                            setMarkdownDraft(null);
                            setTable((current) => moveRow(current, drag.index, rowIndex));
                          }
                          setDrag(null);
                        }}
                      >
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div className="flex sm:hidden">
                        <button
                          type="button"
                          aria-label={`Move row ${rowIndex + 1} up`}
                          disabled={rowIndex === 0}
                          onClick={() => {
                            setMarkdownDraft(null);
                            setTable((current) => moveRow(current, rowIndex, rowIndex - 1));
                          }}
                        >
                          <ChevronUp className="h-4 w-4 text-[var(--muted-ink)]" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Move row ${rowIndex + 1} down`}
                          disabled={rowIndex === table.rows.length - 1}
                          onClick={() => {
                            setMarkdownDraft(null);
                            setTable((current) => moveRow(current, rowIndex, rowIndex + 1));
                          }}
                        >
                          <ChevronDown className="h-4 w-4 text-[var(--muted-ink)]" />
                        </button>
                      </div>
                      {table.rows.length > 1 ? (
                        <button
                          type="button"
                          aria-label={`Remove row ${rowIndex + 1}`}
                          onClick={() => {
                            setMarkdownDraft(null);
                            setTable((current) => removeRow(current, rowIndex));
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-[var(--muted-ink)]" />
                        </button>
                      ) : null}
                    </div>
                  </th>
                  {row.map((cell, col) => (
                    <td key={col} className="border-b border-l border-[var(--hairline)] p-1">
                      <Textarea
                        value={cell}
                        aria-label={`Row ${rowIndex + 1}, column ${col + 1}`}
                        rows={2}
                        className="min-h-16 resize-y border-0 bg-transparent shadow-none focus-visible:ring-0"
                        onChange={(event) => setCell(rowIndex, col, event.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {view === "markdown" ? (
        <div>
          {parseError ? <p className="mb-2 text-sm text-[var(--error)]">{parseError}</p> : null}
          <Label htmlFor="md-table-output">Generated Markdown</Label>
          <Textarea
            id="md-table-output"
            value={output}
            spellCheck={false}
            className="mt-2 min-h-[280px] font-mono text-sm leading-relaxed"
            onChange={(event) => applyMarkdown(event.target.value)}
          />
        </div>
      ) : null}

      {view === "preview" ? (
        <div>
          <p className="mb-2 text-sm font-medium">Live preview</p>
          {previewHtml ? (
            <div className={previewClassName} dangerouslySetInnerHTML={{ __html: previewHtml }} />
          ) : (
            <p className="rounded-lg border border-dashed border-[var(--hairline)] bg-surface-soft px-4 py-8 text-center text-sm text-[var(--muted-ink)]">
              Add some cells to see the rendered table.
            </p>
          )}
        </div>
      ) : null}

      <p className="text-xs text-[var(--muted-ink)]">
        {table.rows.length} × {table.headers.length} · pipes and line breaks are escaped · bold, italic, and code work
        inside cells
      </p>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
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
        className="mt-1 w-24"
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
