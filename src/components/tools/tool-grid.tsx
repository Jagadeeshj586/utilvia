import { SearchX } from "lucide-react";
import type { ReactNode } from "react";
import type { ToolDefinition } from "@/lib/tools/registry";
import { ToolCard } from "@/components/tools/tool-card";
import { EmptyState } from "@/components/ui/empty-state";

export function ToolGrid({
  tools,
  emptyTitle = "No tools match",
  emptyDescription = "Try another keyword, clear filters, or browse a different category.",
  emptyAction,
  featured = false,
}: {
  tools: ToolDefinition[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  featured?: boolean;
}) {
  if (!tools.length) {
    return (
      <EmptyState icon={SearchX} title={emptyTitle} description={emptyDescription} action={emptyAction} />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={`${tool.category}-${tool.slug}`} tool={tool} featured={featured} />
      ))}
    </div>
  );
}
