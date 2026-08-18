"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryChips } from "@/components/tools/category-chips";
import { ToolGrid } from "@/components/tools/tool-grid";
import { CatalogStickySearch } from "@/components/search/sticky-search";
import { TitleTrustRow } from "@/components/layout/title-trust-row";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { searchTools, type CategoryId, type ToolDefinition } from "@/lib/tools/registry";

const PAGE_SIZE = 12;

function sortTools(tools: ToolDefinition[]) {
  return [...tools].sort((a, b) => {
    const ap = a.badge === "popular" ? 0 : 1;
    const bp = b.badge === "popular" ? 0 : 1;
    const ar = a.status === "ready" ? 0 : 1;
    const br = b.status === "ready" ? 0 : 1;
    return ap - bp || ar - br || a.name.localeCompare(b.name);
  });
}

export function ToolsExplorer({
  initialCategory,
  title = "All Tools",
  description,
}: {
  initialCategory?: CategoryId;
  title?: string;
  description?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(initialCategory ?? params.get("category") ?? "all");
  const [page, setPage] = useState(1);

  const tools = useMemo(() => {
    let list = searchTools(query);
    if (category !== "all") list = list.filter((tool) => tool.category === category);
    return sortTools(list);
  }, [query, category]);

  const pageCount = Math.max(1, Math.ceil(tools.length / PAGE_SIZE));
  const paged = tools.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, category]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const onChip = (id: string) => {
    if (initialCategory) {
      router.push(id === "all" ? "/tools" : `/category/${id}`);
      return;
    }
    setCategory(id);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[32px] tracking-[-0.5px] sm:text-[40px]">{title}</h1>
          <p className="mt-2 max-w-2xl leading-[1.65] text-[var(--body)]">
            {description ?? `${tools.length} utilities. Search by name, category, or keyword.`}
          </p>
          <TitleTrustRow className="mt-4" />
        </div>
        <p className="text-sm text-[var(--muted-ink)]">
          {tools.length} result{tools.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-8">
        <CatalogStickySearch value={query} onChange={setQuery} placeholder="Search by name, keyword, or task…">
          <CategoryChips value={category} onChange={onChip} />
        </CatalogStickySearch>
      </div>

      <div className="mt-8">
        <ToolGrid
          tools={paged}
          emptyAction={
            query || category !== "all" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  if (!initialCategory) setCategory("all");
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      </div>

      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </div>
  );
}
