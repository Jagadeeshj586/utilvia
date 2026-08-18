"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { getAllTools, getPopularTools, getReadyTools, searchTools, toolHref, toolId } from "@/lib/tools/registry";
import { getToolIcon } from "@/lib/tools/icons";
import { useRecentsStore } from "@/stores/recents-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const RESULTS_FADE_MS = 300;
const SUGGESTION_LIMIT = 8;

export function HeroSearch({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const router = useRouter();
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);
  const recents = useRecentsStore((s) => s.recents);
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [resultsMounted, setResultsMounted] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const suggested = useMemo(() => {
    const all = getAllTools();
    const popular = getPopularTools();
    const fallback = popular.length ? popular : getReadyTools();
    const recentTools = recents.map((id) => all.find((tool) => toolId(tool) === id)).filter(Boolean);
    const merged = [];
    const seen = new Set<string>();
    for (const tool of [...recentTools, ...fallback]) {
      if (!tool) continue;
      const id = toolId(tool);
      if (seen.has(id)) continue;
      seen.add(id);
      merged.push(tool);
      if (merged.length >= SUGGESTION_LIMIT) break;
    }
    return merged;
  }, [recents]);

  const trimmed = query.trim();
  const results = useMemo(
    () => (trimmed ? searchTools(trimmed).slice(0, SUGGESTION_LIMIT) : suggested),
    [suggested, trimmed],
  );

  const updatePosition = useCallback(() => {
    const field = fieldRef.current;
    if (!field) return;
    const rect = field.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (open) {
      setResultsMounted(true);
      updatePosition();
      const frame = requestAnimationFrame(() => setResultsVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setResultsVisible(false);
    const timer = window.setTimeout(() => setResultsMounted(false), RESULTS_FADE_MS);
    return () => window.clearTimeout(timer);
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onReposition = () => updatePosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const suggestions = resultsMounted
    ? createPortal(
        <ul
          ref={listRef}
          id="toolhub-search-suggestions"
          className={cn(
            "fixed z-[80] max-h-[min(24rem,50vh)] overflow-y-auto rounded-lg shadow-soft transition-opacity duration-300 ease-in-out motion-reduce:transition-none",
            resultsVisible ? "opacity-100" : "pointer-events-none opacity-0",
            tone === "dark"
              ? "border border-white/10 bg-[var(--color-dark-elevated)]"
              : "border border-[var(--hairline)] bg-canvas",
          )}
          style={{ top: coords.top, left: coords.left, width: coords.width }}
          role="listbox"
        >
          <li
            className={cn(
              "px-4 pt-3 pb-1 text-[11px] font-medium uppercase tracking-[0.12em]",
              tone === "dark" ? "text-[var(--on-dark-soft)]" : "text-[var(--muted-ink)]",
            )}
          >
            {trimmed ? "Matching tools" : recents.length ? "Recent & popular" : "Suggested tools"}
          </li>
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
                    onMouseDown={(event) => event.preventDefault()}
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
        </ul>,
        document.body,
      )
    : null;

  return (
    <div ref={rootRef} className={cn("relative mx-auto w-full max-w-2xl", className)}>
      <label className="sr-only" htmlFor="toolhub-search">
        What do you need to do?
      </label>
      <div
        ref={fieldRef}
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
          autoComplete="off"
          aria-expanded={open}
          aria-controls="toolhub-search-suggestions"
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
      {suggestions}
    </div>
  );
}
