"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getCategory, toolHref, type ToolDefinition } from "@/lib/tools/catalog";
import { CATEGORY_STYLES, getToolIcon } from "@/lib/tools/icons";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export function ToolCard({ tool, featured = false }: { tool: ToolDefinition; featured?: boolean }) {
  const Icon = getToolIcon(tool.icon);
  const style = CATEGORY_STYLES[tool.category];
  const category = getCategory(tool.category);
  const badgeLabel =
    tool.status === "soon"
      ? "Soon"
      : tool.badge === "new"
        ? "New"
        : tool.badge === "popular"
          ? "Popular"
          : (category?.label.replace(" Tools", "") ?? tool.category);
  const badgeVariant =
    tool.status === "soon" ? "secondary" : tool.badge === "new" ? "new" : tool.badge === "popular" ? "popular" : "outline";

  return (
    <Link
      href={toolHref(tool)}
      className={cn(
        "group relative flex h-full flex-col rounded-lg border border-[var(--hairline)] bg-surface-card p-5 no-underline sm:p-6",
        featured
          ? "transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
          : "transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-primary hover:bg-surface-soft",
        tool.status === "soon" && "opacity-70 hover:opacity-100",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-md bg-canvas", style.iconFg)}>
          <Icon className="h-5 w-5" />
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Badge variant={badgeVariant}>{badgeLabel}</Badge>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {tool.status === "soon"
              ? "This tool is on the roadmap"
              : tool.privacy === "mixed"
                ? "Mostly on-device"
                : tool.category === "pdf" || tool.category === "image"
                  ? SITE.privacyNote
                  : "Runs in your browser"}
          </TooltipContent>
        </Tooltip>
      </div>
      <h3 className="font-sans text-lg font-medium tracking-normal text-ink">{tool.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-[1.65] text-[var(--body)]">{tool.shortDescription}</p>
      <span
        className={cn(
          "mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors duration-200",
          featured ? "text-primary group-hover:text-[var(--coral-active)]" : "text-primary",
        )}
      >
        Open Tool
        <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
