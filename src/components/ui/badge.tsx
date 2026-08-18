import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none",
  {
    variants: {
      variant: {
        default:
          "border-[var(--hairline)] bg-canvas normal-case tracking-normal text-[var(--muted-ink)]",
        secondary:
          "border-[var(--hairline)] bg-canvas uppercase tracking-[1.5px] text-[var(--muted-ink)]",
        outline:
          "border-[var(--hairline)] bg-canvas normal-case tracking-normal text-[var(--muted-ink)]",
        popular:
          "border-primary/25 bg-primary/10 uppercase tracking-[1.5px] text-primary",
        new: "border-transparent bg-primary uppercase tracking-[1.5px] text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  const dotted = variant === "popular" || variant === "new";

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dotted ? <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
