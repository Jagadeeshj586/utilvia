"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sparkles, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_EXAMPLE,
  EXAMPLE_OPTIONS,
  SCHEMA_DRAFTS,
  SCHEMA_EXAMPLES,
  formatJsonText,
  schemaErrorsCopyText,
  validateJsonSchema,
  type ExampleId,
  type SchemaDraft,
} from "@/lib/json-schema/validate";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

const selectClass =
  "mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary";

export function JsonSchemaValidator() {
  const [draft, setDraft] = useState<SchemaDraft>("draft-7");
  const [example, setExample] = useState<ExampleId>(DEFAULT_EXAMPLE);
  const [schemaText, setSchemaText] = useState(SCHEMA_EXAMPLES[DEFAULT_EXAMPLE].schema);
  const [dataText, setDataText] = useState(SCHEMA_EXAMPLES[DEFAULT_EXAMPLE].data);
  const [copied, setCopied] = useState<string | null>(null);

  const result = useMemo(() => validateJsonSchema(schemaText, dataText, draft), [dataText, draft, schemaText]);

  const loadExample = (id: ExampleId) => {
    const next = SCHEMA_EXAMPLES[id];
    setExample(id);
    setSchemaText(next.schema);
    setDataText(next.data);
    setCopied(null);
  };

  const formatPane = (which: "schema" | "data") => {
    const source = which === "schema" ? schemaText : dataText;
    const formatted = formatJsonText(source);
    if (!formatted.ok) {
      toast.error(formatted.error);
      return;
    }
    if (which === "schema") setSchemaText(`${formatted.value}\n`);
    else setDataText(`${formatted.value}\n`);
    toast.success("Formatted");
  };

  const copyValue = async (value: string, key: string, label: string) => {
    const ok = await copyText(value);
    if (!ok) {
      toast.error("Could not copy");
      return;
    }
    setCopied(key);
    toast.success(label);
    window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1600);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--body)]">
        Validate JSON data against a JSON Schema in real time. Errors include a plain-English explanation, the Ajv
        keyword message, and a copyable path.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="schema-draft">Schema draft</Label>
          <select
            id="schema-draft"
            className={selectClass}
            value={draft}
            onChange={(event) => setDraft(event.target.value as SchemaDraft)}
          >
            {SCHEMA_DRAFTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="schema-example">Load example</Label>
          <select
            id="schema-example"
            className={selectClass}
            value={example}
            onChange={(event) => loadExample(event.target.value as ExampleId)}
          >
            {EXAMPLE_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EditorPane
          id="json-schema-input"
          label="JSON Schema"
          value={schemaText}
          onChange={setSchemaText}
          onFormat={() => formatPane("schema")}
          onClear={() => setSchemaText("")}
        />
        <EditorPane
          id="json-data-input"
          label="JSON Data to Validate"
          value={dataText}
          onChange={setDataText}
          onFormat={() => formatPane("data")}
          onClear={() => setDataText("")}
        />
      </div>

      {result.status === "valid" ? (
        <div className="rounded-xl border border-teal/40 bg-teal/10 px-4 py-3 text-sm font-medium text-ink">
          Valid — JSON data matches the schema
        </div>
      ) : null}

      {result.status === "empty" ? (
        <p className="rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-4 py-6 text-center text-sm text-[var(--muted-ink)]">
          {result.headline}
        </p>
      ) : null}

      {result.status === "schema-parse" || result.status === "data-parse" || result.status === "schema-compile" ? (
        <div
          className="flex items-start gap-2 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-ink"
          role="alert"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-coral" aria-hidden />
          <div>
            <p className="font-medium">{result.headline}</p>
            <p className="mt-1 font-mono text-xs text-[var(--body)]">{result.detail}</p>
          </div>
        </div>
      ) : null}

      {result.status === "invalid" ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3">
            <p className="text-sm font-semibold text-ink">{result.headline}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void copyValue(schemaErrorsCopyText(result), "all", "Errors copied")}
            >
              {copied === "all" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied === "all" ? "Copied" : "Copy errors"}
            </Button>
          </div>
          <ul className="space-y-2">
            {result.errors.map((error, index) => (
              <li
                key={`${error.path}-${error.raw}-${index}`}
                className="rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-sm font-medium text-coral">{error.path}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 shrink-0 px-2 text-xs"
                    onClick={() => void copyValue(error.path, error.path, "Path copied")}
                  >
                    {copied === error.path ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy path
                  </Button>
                </div>
                <p className="mt-1 text-sm text-ink">{error.message}</p>
                <p className="mt-1 font-mono text-xs text-[var(--muted-ink)]">{error.raw}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            loadExample(DEFAULT_EXAMPLE);
            setDraft("draft-7");
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "Real-time", desc: "Validates as you type" },
          { title: "Draft 7 & 2020", desc: "Both schema versions" },
          { title: "Readable errors", desc: "Plain English messages" },
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

function EditorPane({
  id,
  label,
  value,
  onChange,
  onFormat,
  onClear,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFormat: () => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--hairline)] bg-surface-card p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex gap-1">
          <Button type="button" size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={onFormat}>
            <Sparkles className="h-3.5 w-3.5" />
            Format
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={onClear}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </div>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        className={cn("min-h-[280px] font-mono text-[13px] leading-6")}
      />
    </div>
  );
}
