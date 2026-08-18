"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { ToolGrid } from "@/components/tools/tool-grid";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAllTools, toolId, type ToolDefinition } from "@/lib/tools/registry";
import { useRecentsStore } from "@/stores/recents-store";

export function FavouritesList() {
  const [mounted, setMounted] = useState(false);
  const favorites = useRecentsStore((s) => s.favorites);
  const tools = getAllTools();

  useEffect(() => {
    setMounted(true);
  }, []);

  const favoriteTools = useMemo(
    () =>
      favorites
        .map((id) => tools.find((tool) => toolId(tool) === id))
        .filter((tool): tool is ToolDefinition => Boolean(tool)),
    [favorites, tools],
  );

  if (!mounted) {
    return <div className="min-h-[180px]" aria-hidden />;
  }

  if (!favoriteTools.length) {
    return (
      <EmptyState
        icon={Star}
        title="No favourites yet"
        description="Open a tool and tap Save tool to add it here. Your favourites stay on this device."
        action={
          <Button asChild>
            <Link href="/tools">Browse tools</Link>
          </Button>
        }
      />
    );
  }

  return <ToolGrid tools={favoriteTools} featured />;
}
