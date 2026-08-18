import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ToolNotice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      role="note"
      className={cn(
        "rounded-md border border-[var(--hairline)] bg-surface-soft px-3 py-2 text-xs leading-5 text-[var(--muted-ink)]",
        className,
      )}
    >
      {children}
    </p>
  );
}
