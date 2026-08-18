"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type ComponentType } from "react";
import { LayoutGrid, MessageSquarePlus, Sparkles, Star } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CATEGORIES, getAllTools, getPopularTools, searchTools, toolHref, toolId } from "@/lib/tools/catalog";
import { CATEGORY_ICONS, CATEGORY_STYLES } from "@/lib/tools/category-icons";
import { cn } from "@/lib/utils";
import { useRecentsStore } from "@/stores/recents-store";
import { useUiStore } from "@/stores/ui-store";

const PAGE_LINKS = [
  { href: "/tools", value: "all tools catalog", label: "All Tools", icon: LayoutGrid, iconClass: "text-primary" },
  { href: "/popular", value: "popular tools", label: "Popular Tools", icon: Sparkles, iconClass: "text-primary" },
  { href: "/favourites", value: "favourite tools favorites saved", label: "Favourites", icon: Star, iconClass: "text-[var(--accent-amber)]" },
  { href: "/contact", value: "suggest a tool contact", label: "Suggest a Tool", icon: MessageSquarePlus, iconClass: "text-ink" },
] as const;

function RowIcon({ icon: Icon, className }: { icon: ComponentType<{ className?: string }>; className: string }) {
  return (
    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-card", className)}>
      <Icon className="h-4 w-4" />
    </span>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const recents = useRecentsStore((s) => s.recents);
  const favorites = useRecentsStore((s) => s.favorites);
  const tools = getAllTools();
  const [query, setQuery] = useState("");

  const recentTools = useMemo(
    () => recents.map((id) => tools.find((tool) => toolId(tool) === id)).filter(Boolean),
    [recents, tools],
  );

  const favoriteTools = useMemo(
    () => favorites.map((id) => tools.find((tool) => toolId(tool) === id)).filter(Boolean),
    [favorites, tools],
  );

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const trimmed = query.trim();
  const visibleTools = useMemo(() => {
    if (trimmed) return searchTools(trimmed).slice(0, 20);
    return getPopularTools().slice(0, 8);
  }, [trimmed]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="What do you need to do?" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No tools match that search.</CommandEmpty>
        <CommandGroup heading="Pages">
          {PAGE_LINKS.map((page) => (
            <CommandItem key={page.href} value={page.value} onSelect={() => go(page.href)}>
              <RowIcon icon={page.icon} className={page.iconClass} />
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Categories">
          {CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.id];
            const style = CATEGORY_STYLES[category.id];
            return (
              <CommandItem
                key={`cat-${category.id}`}
                value={`${category.label} ${category.description}`}
                onSelect={() => go(`/category/${category.id}`)}
              >
                <RowIcon icon={Icon} className={style.iconFg} />
                {category.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        {favoriteTools.length ? (
          <CommandGroup heading="Favorites">
            {favoriteTools.map((tool) => {
              if (!tool) return null;
              const Icon = CATEGORY_ICONS[tool.category];
              const style = CATEGORY_STYLES[tool.category];
              return (
                <CommandItem
                  key={`fav-${toolId(tool)}`}
                  value={`${tool.name} ${tool.keywords.join(" ")} favorite`}
                  onSelect={() => go(toolHref(tool))}
                >
                  <RowIcon icon={Icon} className={style.iconFg} />
                  <span className="flex flex-col">
                    <span>{tool.name}</span>
                    <span className="text-xs text-muted-foreground">{tool.shortDescription}</span>
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ) : null}
        {recentTools.length ? (
          <CommandGroup heading="Recent">
            {recentTools.map((tool) => {
              if (!tool) return null;
              const Icon = CATEGORY_ICONS[tool.category];
              const style = CATEGORY_STYLES[tool.category];
              return (
                <CommandItem
                  key={`recent-${toolId(tool)}`}
                  value={`${tool.name} ${tool.keywords.join(" ")} recent`}
                  onSelect={() => go(toolHref(tool))}
                >
                  <RowIcon icon={Icon} className={style.iconFg} />
                  <span className="flex flex-col">
                    <span>{tool.name}</span>
                    <span className="text-xs text-muted-foreground">{tool.shortDescription}</span>
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ) : null}
        <CommandGroup heading={trimmed ? "Tools" : "Popular"}>
          {visibleTools.map((tool) => {
            const Icon = CATEGORY_ICONS[tool.category];
            const style = CATEGORY_STYLES[tool.category];
            return (
              <CommandItem
                key={toolId(tool)}
                value={`${tool.name} ${tool.category} ${tool.keywords.join(" ")}`}
                onSelect={() => go(toolHref(tool))}
              >
                <RowIcon icon={Icon} className={style.iconFg} />
                <span className="flex flex-col">
                  <span>{tool.name}</span>
                  <span className="text-xs text-muted-foreground">{tool.shortDescription}</span>
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
