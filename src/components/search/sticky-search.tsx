"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";

export function CatalogStickySearch({
  value,
  onChange,
  placeholder = "Search tools…",
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
}) {
  return (
    <div className="sticky top-16 z-30 -mx-4 space-y-3 border-b border-[var(--hairline)] bg-canvas/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <label className="sr-only" htmlFor="catalog-search">
        Search tools
      </label>
      <div className="flex items-center gap-2 rounded-md border border-[var(--hairline)] bg-canvas px-3">
        <Search className="h-4 w-4 text-primary" aria-hidden />
        <input
          id="catalog-search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-[var(--muted-ink)]"
        />
        {value ? (
          <button type="button" className="text-xs font-medium text-[var(--muted-ink)] hover:text-ink" onClick={() => onChange("")}>
            Clear
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}
