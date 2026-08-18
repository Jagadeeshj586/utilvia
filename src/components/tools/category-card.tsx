import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryId } from "@/lib/tools/catalog";
import { getToolsByCategory } from "@/lib/tools/catalog";
import { CATEGORY_STYLES, getToolIcon } from "@/lib/tools/icons";

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
  const preview = tools[0];
  const Icon = preview ? getToolIcon(preview.icon) : ArrowRight;
  const style = CATEGORY_STYLES[id];
  const ready = tools.filter((tool) => tool.status === "ready").length;

  return (
    <Link
      href={`/category/${id}`}
      className="group flex h-full flex-col rounded-lg border border-[var(--hairline)] bg-surface-card p-5 no-underline transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow sm:p-6"
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-md bg-canvas ${style.iconFg}`}>
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-sans text-lg font-medium tracking-normal">{label}</h3>
      <p className="mt-2 flex-1 text-sm leading-[1.65] text-[var(--body)]">{description}</p>
      <span className="mt-4 inline-flex items-center justify-between text-sm font-medium text-primary transition-colors duration-200 group-hover:text-[var(--coral-active)]">
        {tools.length} tools · {ready} ready
        <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
