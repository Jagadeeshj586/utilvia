import * as React from "react";
import { CalendarDays, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

const pickerTypes = new Set(["date", "time", "datetime-local"]);

const inputBaseClassName =
  "flex h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-[14px] py-2.5 text-base shadow-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--muted-ink)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/15 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => {
    const isPicker = pickerTypes.has(type);

    if (!isPicker) {
      return <input type={type} className={cn(inputBaseClassName, className)} ref={ref} {...props} />;
    }

    const Icon = type === "time" ? Clock3 : CalendarDays;

    return (
      <div className={cn("input-with-picker w-full", className)}>
        <input type={type} className={cn(inputBaseClassName, "h-full min-h-10")} ref={ref} {...props} />
        <Icon className="picker-icon" aria-hidden="true" />
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
