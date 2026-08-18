"use client";

import { Lock } from "lucide-react";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export function PrivacyBadge({ className }: { className?: string }) {
  return (
    <p
      role="note"
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full bg-surface-soft px-4 py-2 text-left text-sm font-medium leading-snug text-ink",
        className,
      )}
    >
      <Lock className="h-4 w-4 shrink-0 text-[var(--accent-teal)]" aria-hidden />
      {SITE.privacyNote}
    </p>
  );
}
