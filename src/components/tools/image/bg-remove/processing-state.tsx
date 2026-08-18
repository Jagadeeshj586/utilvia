import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcessingStage, StageStatus } from "@/lib/image/background-removal";

const STEPS: Array<{ id: ProcessingStage; label: string }> = [
  { id: "validate", label: "Image uploaded" },
  { id: "analyze", label: "Image analyzed" },
  { id: "segment", label: "Background detected" },
  { id: "refine", label: "Refining edges" },
  { id: "compose", label: "Preparing result" },
];

function statusFor(step: ProcessingStage, current: ProcessingStage | null, error: boolean): StageStatus {
  if (!current) return "pending";
  if (error && step === current) return "error";
  const mappedCurrent = current === "decontaminate" || current === "retry" ? "refine" : current === "done" ? "compose" : current;
  const stepIndex = STEPS.findIndex((item) => item.id === step);
  const currentIndex = STEPS.findIndex((item) => item.id === mappedCurrent);
  if (current === "done") return "complete";
  if (stepIndex < currentIndex) return "complete";
  if (stepIndex === currentIndex) return "active";
  return "pending";
}

export function ProcessingState({
  stage,
  detail,
  error,
  downloading,
}: {
  stage: ProcessingStage | null;
  detail?: string;
  error?: boolean;
  downloading?: { loaded: number; total: number } | null;
}) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-3 py-3 sm:px-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">{error ? "Processing failed" : "Processing…"}</p>
        {!error ? <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden /> : null}
      </div>
      {downloading && downloading.total > 0 ? (
        <p className="mb-3 text-xs text-[var(--muted-ink)]">
          Loading AI model… {Math.min(100, Math.round((downloading.loaded / downloading.total) * 100))}%
        </p>
      ) : null}
      <ol className="space-y-2.5">
        {STEPS.map((step) => {
          const status = statusFor(step.id, stage, Boolean(error));
          return (
            <li key={step.id} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px]",
                  status === "complete" && "border-primary bg-primary text-primary-foreground",
                  status === "active" && "border-primary text-primary",
                  status === "pending" && "border-[var(--hairline)] text-[var(--muted-ink)]",
                  status === "error" && "border-destructive text-destructive",
                )}
                aria-hidden
              >
                {status === "complete" ? <Check className="h-3 w-3" /> : status === "active" ? "●" : "○"}
              </span>
              <span className={cn(status === "pending" ? "text-[var(--muted-ink)]" : "text-ink")}>{step.label}</span>
            </li>
          );
        })}
      </ol>
      {detail && !error ? <p className="mt-3 text-xs text-[var(--muted-ink)]">{detail}</p> : null}
    </div>
  );
}
