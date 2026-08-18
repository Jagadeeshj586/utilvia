import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-5 font-sans text-lg font-medium text-ink">{title}</h2>
      {description ? <p className="mt-3 max-w-md text-sm leading-[1.65] text-[var(--body)]">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
