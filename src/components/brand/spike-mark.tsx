import { cn } from "@/lib/utils";

export function SpikeMark({ className, tone = "ink" }: { className?: string; tone?: "ink" | "coral" | "cream" }) {
  const fill = tone === "coral" ? "var(--coral)" : tone === "cream" ? "var(--on-dark)" : "var(--ink)";

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-4 w-4 shrink-0", className)}
      fill={fill}
    >
      <path d="M12 1.2 13.15 9.4 21.8 8.1 14.9 12 21.8 15.9 13.15 14.6 12 22.8 10.85 14.6 2.2 15.9 9.1 12 2.2 8.1 10.85 9.4Z" />
    </svg>
  );
}
