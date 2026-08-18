import Link from "next/link";
import { Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { ToolDefinition } from "@/lib/tools/registry";

export function ComingSoon({ tool }: { tool: ToolDefinition }) {
  return (
    <EmptyState
      icon={Hourglass}
      title={`${tool.name} is almost ready`}
      description="This workspace is on the Utilvia roadmap. Suggest a detail you need - format, India-specific rules, or local-only processing - and we will prioritize it."
      action={
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/contact">Suggest a Tool</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/tools">Browse ready tools</Link>
          </Button>
        </div>
      }
    />
  );
}
