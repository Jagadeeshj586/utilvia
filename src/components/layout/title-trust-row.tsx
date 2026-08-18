import { CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    icon: ShieldCheck,
    label: "Private & secure",
    iconClass: "text-teal",
  },
  {
    icon: Zap,
    label: "Fast in-browser",
    iconClass: "text-coral",
  },
  {
    icon: CheckCircle2,
    label: "No signup",
    iconClass: "text-ink",
  },
] as const;

export function TitleTrustRow({
  className,
  align = "start",
}: {
  className?: string;
  align?: "start" | "center";
}) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] font-medium text-[var(--body)]",
        align === "center" ? "justify-center" : "justify-start",
        className,
      )}
    >
      {ITEMS.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-2">
          <item.icon className={cn("h-4 w-4 shrink-0", item.iconClass)} strokeWidth={1.75} aria-hidden />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
