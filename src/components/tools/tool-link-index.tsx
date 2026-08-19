import Link from "next/link";
import { toolHref, type ToolDefinition } from "@/lib/tools/catalog";

export function ToolLinkIndex({
  tools,
  heading,
}: {
  tools: ToolDefinition[];
  heading: string;
}) {
  return (
    <nav aria-label={heading} className="mt-12 border-t border-[var(--hairline)] pt-8">
      <h2 className="font-display text-[22px] tracking-[-0.3px] text-ink">{heading}</h2>
      <ul className="mt-4 columns-1 gap-x-8 sm:columns-2 lg:columns-3">
        {tools.map((tool) => (
          <li key={`${tool.category}/${tool.slug}`} className="break-inside-avoid py-1">
            <Link href={toolHref(tool)} className="text-sm text-primary hover:underline">
              {tool.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
