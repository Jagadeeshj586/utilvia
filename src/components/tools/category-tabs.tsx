"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/tools/catalog";

const TABS = [
  { id: "all", label: "All", href: "/tools" },
  ...CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    href: `/category/${c.id}`,
  })),
];

export function CategoryTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const active =
          tab.id === "all"
            ? pathname === "/tools"
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "rounded-md px-3.5 py-2 text-sm font-medium",
              active ? "bg-surface-card text-ink" : "bg-transparent text-[var(--muted-ink)]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
