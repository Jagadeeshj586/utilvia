"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Search, Star } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";

const MegaMenu = dynamic(() => import("@/components/layout/mega-menu").then((module) => module.MegaMenu), {
  ssr: false,
});

function ToolsPlaceholder({ onActivate }: { onActivate: () => void }) {
  return (
    <Button
      variant="ghost"
      className="gap-1 text-[14px] font-medium leading-[1.4] text-ink"
      aria-expanded={false}
      aria-haspopup="true"
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
    >
      Tools
      <ChevronDown className="h-3.5 w-3.5" />
    </Button>
  );
}

export function HeaderActions() {
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);
  const [menuReady, setMenuReady] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <nav aria-label="Primary" onMouseEnter={() => setMenuReady(true)}>
        {menuReady ? <MegaMenu /> : <ToolsPlaceholder onActivate={() => setMenuReady(true)} />}
      </nav>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search tools"
        title="Search tools (⌘K)"
        onClick={() => setCommandOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <Link href="/favourites" aria-label="Favourite tools" title="Favourites">
          <Star className="h-4 w-4" />
        </Link>
      </Button>
      <ThemeToggle />
    </div>
  );
}
