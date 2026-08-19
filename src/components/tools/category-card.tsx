import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CategoryId } from "@/lib/tools/catalog";
import { getToolsByCategory } from "@/lib/tools/catalog";
import { CATEGORY_ICONS, CATEGORY_STYLES } from "@/lib/tools/category-icons";

export function CategoryCard({
  id,
  label,
  description,
}: {
  id: CategoryId;
  label: string;
  description: string;
}) {
  const tools = getToolsByCategory(id);
  const Icon = CATEGORY_ICONS[id];
  const style = CATEGORY_STYLES[id];
  const popular = tools.some((tool) => tool.badge === "popular");

  return (
    <Link
      href={`/category/${id}`}
      className="group relative flex h-full flex-col rounded-2xl border border-[var(--hairline)] bg-surface-card p-5 no-underline transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow motion-reduce:transform-none motion-reduce:transition-none sm:p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg bg-canvas ${style.iconFg}`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        {popular ? (
          <Badge variant="popular">Popular</Badge>
        ) : (
          <Badge variant="outline">{tools.length} tools</Badge>
        )}
      </div>
      <h3 className="font-sans text-lg font-medium tracking-normal text-ink">{label}</h3>
      <p className="mt-2 flex-1 text-sm leading-[1.65] text-[var(--body)]">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors duration-200 group-hover:text-[var(--coral-active)]">
        Open Tools
        <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
