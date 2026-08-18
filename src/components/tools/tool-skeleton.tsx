import { Skeleton } from "@/components/ui/skeleton";

export function ToolCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-lg bg-surface-card p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between">
        <Skeleton className="h-10 w-10 rounded-md bg-canvas" />
        <Skeleton className="h-5 w-14 rounded-full bg-canvas" />
      </div>
      <Skeleton className="h-5 w-2/3 bg-canvas" />
      <Skeleton className="mt-2 h-4 w-full bg-canvas" />
      <Skeleton className="mt-1.5 h-4 w-4/5 bg-canvas" />
      <Skeleton className="mt-4 h-4 w-24 bg-canvas" />
    </div>
  );
}

export function ToolGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <ToolCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ToolTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--hairline)]">
      <div className="h-11 bg-surface-soft" />
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 border-t border-[var(--hairline)] px-4 py-3.5">
          <Skeleton className="h-9 w-9 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
          <Skeleton className="hidden h-5 w-20 sm:block" />
          <Skeleton className="hidden h-5 w-16 md:block" />
        </div>
      ))}
    </div>
  );
}
