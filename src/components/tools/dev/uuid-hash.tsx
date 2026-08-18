"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatUuid(uuid: string, uppercase: boolean, includeHyphens: boolean) {
  const result = includeHyphens ? uuid : uuid.replace(/-/g, "");
  return uppercase ? result.toUpperCase() : result;
}

export function UuidHashGenerator() {
  const [count, setCount] = useState(5);
  const [rawUuids, setRawUuids] = useState<string[]>([]);
  const [uppercase, setUppercase] = useState(false);
  const [includeHyphens, setIncludeHyphens] = useState(true);

  const uuids = useMemo(
    () => rawUuids.map((uuid) => formatUuid(uuid, uppercase, includeHyphens)),
    [rawUuids, uppercase, includeHyphens],
  );

  const generate = () => {
    const n = Math.min(Math.max(Math.round(count) || 1, 1), 100);
    setCount(n);
    setRawUuids(Array.from({ length: n }, () => crypto.randomUUID()));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="uuid-count">How many</Label>
          <Input
            id="uuid-count"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
            className="w-28"
          />
        </div>
        <Button type="button" onClick={generate}>
          Generate
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!uuids.length}
          onClick={async () => {
            await navigator.clipboard.writeText(uuids.join("\n"));
            toast.success("Copied UUIDs");
          }}
        >
          Copy all
        </Button>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            id="uuid-uppercase"
            type="checkbox"
            checked={uppercase}
            onChange={(event) => setUppercase(event.target.checked)}
            className="rounded border-[var(--hairline)]"
          />
          Uppercase
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            id="uuid-hyphens"
            type="checkbox"
            checked={includeHyphens}
            onChange={(event) => setIncludeHyphens(event.target.checked)}
            className="rounded border-[var(--hairline)]"
          />
          Include hyphens
        </label>
      </div>
      {uuids.length ? (
        <ul className="space-y-2">
          {uuids.map((id, index) => (
            <li
              key={rawUuids[index]}
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--hairline)] bg-surface-soft px-3 py-2 font-mono text-sm"
            >
              <span className="truncate">{id}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await navigator.clipboard.writeText(id);
                  toast.success("Copied");
                }}
              >
                Copy
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Generate UUID v4 identifiers locally with the Web Crypto API.</p>
      )}
    </div>
  );
}
