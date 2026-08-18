"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchTools, toolHref } from "@/lib/tools/registry";
import { getToolIcon } from "@/lib/tools/icons";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const RESULTS_FADE_MS = 300;

export function HeroSearch({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const router = useRouter();
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [resultsMounted, setResultsMounted] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);

  const results = useMemo(() => (query.trim() ? searchTools(query).slice(0, 8) : []), [query]);
  const showResults = open && query.trim().length > 0;

  useEffect(() => {
    if (showResults) {
      setResultsMounted(true);
      const frame = requestAnimationFrame(() => setResultsVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setResultsVisible(false);
    const timer = window.setTimeout(() => setResultsMounted(false), RESULTS_FADE_MS);
    return () => window.clearTimeout(timer);
  }, [showResults]);

  return (
    <div className={cn("relative mx-auto w-full max-w-2xl", className)}>
      <label className="sr-only" htmlFor="toolhub-search">
        What do you need to do?
      </label>
      <div
        className={cn(
          "flex items-center gap-3 rounded-md px-4 py-3 transition-all duration-150",
          tone === "dark"
            ? "border border-white/10 bg-[var(--color-dark-elevated)] focus-within:border-[var(--color-primary)]/60"
            : "border border-[var(--hairline)] bg-canvas focus-within:border-primary",
        )}
      >
        <Search className="h-5 w-5 text-primary" aria-hidden />
        <input
          id="toolhub-search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
              event.preventDefault();
              setCommandOpen(true);
            }
            if (event.key === "Enter" && results[0]) {
              router.push(toolHref(results[0]));
              setOpen(false);
            }
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder="Search PDF tools, calculators, image tools, JSON formatter..."
          className={cn(
            "min-w-0 flex-1 bg-transparent text-base outline-none",
            tone === "dark"
              ? "text-[var(--on-dark)] placeholder:text-[var(--on-dark-soft)]"
              : "text-ink placeholder:text-[var(--muted-ink)]",
          )}
        />
        <kbd
          className={cn(
            "hidden rounded-md px-2 py-1 text-[11px] font-medium sm:inline",
            tone === "dark"
              ? "border border-white/10 bg-white/5 text-[var(--on-dark-soft)]"
              : "border border-[var(--hairline)] bg-surface-soft text-[var(--muted-ink)]",
          )}
        >
          ⌘K
        </kbd>
      </div>
      {resultsMounted ? (
        <ul
          className={cn(
            "absolute z-20 mt-2 w-full overflow-hidden rounded-lg shadow-soft transition-opacity duration-300 ease-in-out motion-reduce:transition-none",
            resultsVisible ? "opacity-100" : "pointer-events-none opacity-0",
            tone === "dark"
              ? "border border-white/10 bg-[var(--color-dark-elevated)]"
              : "border border-[var(--hairline)] bg-canvas",
          )}
          role="listbox"
        >
          {results.length === 0 ? (
            <li
              className={cn(
                "px-4 py-6 text-center text-sm",
                tone === "dark" ? "text-[var(--on-dark-soft)]" : "text-[var(--muted-ink)]",
              )}
            >
              No tools match that search.
            </li>
          ) : (
            results.map((tool) => {
              const Icon = getToolIcon(tool.icon);
              return (
                <li key={`${tool.category}/${tool.slug}`}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150",
                      tone === "dark" ? "text-[var(--on-dark)] hover:bg-white/5" : "hover:bg-surface-soft",
                    )}
                    onClick={() => {
                      router.push(toolHref(tool));
                      setOpen(false);
                    }}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-md text-primary",
                        tone === "dark" ? "bg-[var(--color-dark-soft)]" : "bg-surface-card",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{tool.name}</span>
                      <span
                        className={cn(
                          "block truncate text-xs",
                          tone === "dark" ? "text-[var(--on-dark-soft)]" : "text-[var(--muted-ink)]",
                        )}
                      >
                        {tool.shortDescription}
                      </span>
                    </span>
                    {tool.status === "soon" ? (
                      <span
                        className={cn(
                          "text-[11px] font-medium uppercase tracking-wide",
                          tone === "dark" ? "text-[var(--on-dark-soft)]" : "text-[var(--muted-ink)]",
                        )}
                      >
                        Soon
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
