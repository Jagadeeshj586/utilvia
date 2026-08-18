"use client";

import { CATEGORIES, getToolsByCategory } from "@/lib/tools/catalog";
import { cn } from "@/lib/utils";

export function CategoryChips({
  value = "all",
  onChange,
  showCounts = true,
}: {
  value?: string;
  onChange: (id: string) => void;
  showCounts?: boolean;
}) {
  const chips = [{ id: "all", label: "All tools", count: undefined }, ...CATEGORIES.map((c) => ({ ...c, count: getToolsByCategory(c.id).length }))];

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filter by category">
      {chips.map((chip) => {
        const active = value === chip.id;
        return (
          <button
            key={chip.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(chip.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-150",
              active
                ? "border-ink bg-ink text-canvas"
                : "border-transparent bg-surface-card text-ink hover:border-primary hover:text-primary",
            )}
          >
            {chip.label}
            {showCounts && chip.count != null ? (
              <span className={cn("ml-1.5 text-[11px]", active ? "text-canvas/70" : "text-[var(--muted-ink)]")}>
                {chip.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
