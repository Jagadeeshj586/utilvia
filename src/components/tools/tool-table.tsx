"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getCategory, toolHref, type ToolDefinition } from "@/lib/tools/catalog";
import { CATEGORY_STYLES, getToolIcon } from "@/lib/tools/icons";
import { cn } from "@/lib/utils";

type SortKey = "name" | "category" | "status";
type SortDir = "asc" | "desc";

export function ToolTable({ tools }: { tools: ToolDefinition[] }) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rows = useMemo(() => {
    return [...tools].sort((a, b) => {
      const left = sortValue(a, sortKey);
      const right = sortValue(b, sortKey);
      const cmp = left.localeCompare(right);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [tools, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHead label="Tool" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
          <SortableHead label="Category" active={sortKey === "category"} dir={sortDir} onClick={() => toggleSort("category")} className="hidden sm:table-cell" />
          <SortableHead label="Status" active={sortKey === "status"} dir={sortDir} onClick={() => toggleSort("status")} className="hidden md:table-cell" />
          <TableHead className="hidden lg:table-cell">Privacy</TableHead>
          <TableHead className="w-[90px] text-right">Open</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((tool) => {
          const Icon = getToolIcon(tool.icon);
          const style = CATEGORY_STYLES[tool.category];
          const category = getCategory(tool.category);
          return (
            <TableRow
              key={`${tool.category}-${tool.slug}`}
              className="cursor-pointer"
              onClick={() => router.push(toolHref(tool))}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-card", style.iconFg)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{tool.name}</p>
                    <p className="truncate text-xs text-[var(--muted-ink)]">{tool.shortDescription}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-[var(--body)]">{category?.label ?? tool.category}</TableCell>
              <TableCell className="hidden md:table-cell">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Badge
                        variant={
                          tool.status === "soon"
                            ? "secondary"
                            : tool.badge === "new"
                              ? "new"
                              : tool.badge === "popular"
                                ? "popular"
                                : "outline"
                        }
                      >
                        {tool.status === "soon" ? "Soon" : tool.badge === "new" ? "New" : tool.badge === "popular" ? "Popular" : "Ready"}
                      </Badge>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{tool.status === "soon" ? "On the roadmap" : "Ready to use in your browser"}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-[var(--body)]">
                {tool.privacy === "mixed" ? "Mostly local" : "On-device"}
              </TableCell>
              <TableCell className="text-right text-sm font-medium text-primary">Open →</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function sortValue(tool: ToolDefinition, key: SortKey) {
  if (key === "category") return getCategory(tool.category)?.label ?? tool.category;
  if (key === "status") return tool.status === "soon" ? "soon" : tool.badge ?? "ready";
  return tool.name;
}

function SortableHead({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead className={className}>
      <button type="button" onClick={onClick} className="inline-flex items-center gap-1 hover:text-ink">
        {label}
        <Icon className="h-3.5 w-3.5" />
      </button>
    </TableHead>
  );
}
