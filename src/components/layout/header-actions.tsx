"use client";

import Link from "next/link";
import { Search, Star } from "lucide-react";
import { MegaMenu } from "@/components/layout/mega-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/ui-store";

export function HeaderActions() {
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);

  return (
    <div className="flex items-center gap-1">
      <nav aria-label="Primary">
        <MegaMenu />
      </nav>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Search tools" onClick={() => setCommandOpen(true)}>
            <Search className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Search tools (⌘K)</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/favourites" aria-label="Favourite tools">
              <Star className="h-4 w-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Favourites</TooltipContent>
      </Tooltip>
      <ThemeToggle />
    </div>
  );
}
