"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  getAllTools,
  getToolsByCategory,
  searchTools,
  toolHref,
  type CategoryId,
  type ToolDefinition,
} from "@/lib/tools/catalog";
import { CATEGORY_ICONS, CATEGORY_STYLES, getToolIcon } from "@/lib/tools/icons";
import { cn } from "@/lib/utils";

function sortTools(tools: ToolDefinition[]) {
  return [...tools].sort((a, b) => {
    const score = (tool: ToolDefinition) => (tool.badge === "popular" ? 0 : tool.status === "ready" ? 1 : 2);
    return score(a) - score(b) || a.name.localeCompare(b.name);
  });
}

export function MegaMenu({ onDark = false }: { onDark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId>(CATEGORIES[0].id);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const openedByPointerRef = useRef(false);
  const total = getAllTools().length;
  const searching = query.trim().length > 0;
  const active = CATEGORIES.find((category) => category.id === activeCategory) ?? CATEGORIES[0];
  const categoryCount = getToolsByCategory(active.id).length;

  const tools = useMemo(() => {
    if (searching) return sortTools(searchTools(query));
    return sortTools(getToolsByCategory(activeCategory));
  }, [activeCategory, query, searching]);

  const clearCloseTimer = () => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const close = () => {
    clearCloseTimer();
    setOpen(false);
    setQuery("");
    setActiveCategory(CATEGORIES[0].id);
    openedByPointerRef.current = false;
  };

  const openMenu = (focusSearch = false) => {
    clearCloseTimer();
    setOpen(true);
    openedByPointerRef.current = !focusSearch;
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      close();
    }, 150);
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  useEffect(() => {
    if (!open || openedByPointerRef.current) return;
    const id = window.requestAnimationFrame(() => searchRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => openMenu(false)}
      onMouseLeave={scheduleClose}
    >
      <Button
        variant="ghost"
        className={cn(
          "gap-1 text-[14px] font-medium leading-[1.4]",
          open ? "text-primary hover:text-primary" : onDark ? "text-[var(--on-dark)] hover:text-[var(--on-dark)]" : "text-ink",
        )}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => {
          if (open) close();
          else openMenu(true);
        }}
        onFocus={() => openMenu(true)}
      >
        Tools
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200 ease-out", open && "rotate-180")} />
      </Button>
      {open ? (
        <div className="absolute inset-x-0 top-full z-50 pt-3">
          <div className="animate-fade-in-up overflow-hidden rounded-lg border border-[var(--hairline)] bg-canvas shadow-soft">
            <div className="border-b border-[var(--hairline)] p-3">
              <label className="sr-only" htmlFor="tools-menu-search">
                Search tools
              </label>
              <div className="flex items-center gap-2 rounded-md border border-[var(--hairline)] bg-surface-soft px-3">
                <Search className="h-4 w-4 shrink-0 text-[var(--muted-ink)]" aria-hidden />
                <input
                  ref={searchRef}
                  id="tools-menu-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={`Search ${total} tools...`}
                  className="h-10 w-full bg-transparent text-sm text-ink outline-none placeholder:text-[var(--muted-ink)]"
                />
              </div>
            </div>

            <div className="flex max-h-[min(70vh,520px)] flex-col sm:flex-row">
              <aside className="shrink-0 border-b border-[var(--hairline)] sm:w-56 sm:border-b-0 sm:border-r">
                <nav
                  aria-label="Tool categories"
                  className="flex gap-1 overflow-x-auto p-2 sm:max-h-[min(70vh,520px)] sm:flex-col sm:overflow-y-auto"
                >
                  {CATEGORIES.map((category) => {
                    const Icon = CATEGORY_ICONS[category.id];
                    const count = getToolsByCategory(category.id).length;
                    const selected = !searching && category.id === activeCategory;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(category.id);
                          setQuery("");
                        }}
                        className={cn(
                          "flex min-w-[11rem] items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-150 sm:min-w-0",
                          selected ? "bg-surface-soft text-ink" : "text-[var(--body)] hover:bg-surface-soft hover:text-ink",
                        )}
                        aria-current={selected ? "page" : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-[var(--muted-ink)]" aria-hidden />
                        <span className="min-w-0 flex-1 truncate">{category.label.split(" / ")[0]}</span>
                        <span className="text-[11px] tabular-nums text-[var(--muted-ink)]">{count}</span>
                      </button>
                    );
                  })}
                </nav>
              </aside>

              <div className="min-w-0 flex-1 overflow-y-auto p-3">
                {tools.length ? (
                  <ul className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 md:grid-cols-3">
                    {tools.map((tool) => {
                      const Icon = getToolIcon(tool.icon);
                      const style = CATEGORY_STYLES[tool.category];
                      return (
                        <li key={`${tool.category}-${tool.slug}`}>
                          <Link
                            href={toolHref(tool)}
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-[var(--body)] transition-colors duration-150 hover:bg-surface-soft hover:text-ink"
                            onClick={close}
                          >
                            <span
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-card",
                                style.iconFg,
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="truncate">{tool.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="px-2 py-10 text-center text-sm text-[var(--muted-ink)]">No tools match that search.</p>
                )}

                {!searching ? (
                  <Link
                    href={`/category/${active.id}`}
                    className="mt-3 inline-flex px-2 text-sm font-medium text-primary hover:underline"
                    onClick={close}
                  >
                    View all {categoryCount} {active.label.split(" / ")[0].toLowerCase()} →
                  </Link>
                ) : (
                  <Link href="/tools" className="mt-3 inline-flex px-2 text-sm font-medium text-primary hover:underline" onClick={close}>
                    View all search results →
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[var(--hairline)] px-4 py-3">
              <p className="text-sm text-[var(--muted-ink)]">{total} free tools - no signup required.</p>
              <Link href="/tools" className="shrink-0 text-sm font-medium text-primary hover:underline" onClick={close}>
                View All Tools →
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
