import type { LucideIcon } from "lucide-react";
import { Calculator, Code, FileText, GraduationCap, Image, Timer, Type, Wrench } from "lucide-react";
import type { CategoryId } from "./catalog";

export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  pdf: FileText,
  image: Image,
  text: Type,
  developer: Code,
  finance: Calculator,
  student: GraduationCap,
  productivity: Timer,
  other: Wrench,
};

export const CATEGORY_STYLES: Record<CategoryId, { iconBg: string; iconFg: string }> = {
  pdf: { iconBg: "bg-canvas", iconFg: "text-[var(--coral)]" },
  image: { iconBg: "bg-canvas", iconFg: "text-[var(--accent-amber)]" },
  text: { iconBg: "bg-canvas", iconFg: "text-[var(--accent-amber)]" },
  developer: { iconBg: "bg-canvas", iconFg: "text-ink" },
  finance: { iconBg: "bg-canvas", iconFg: "text-[var(--accent-teal)]" },
  student: { iconBg: "bg-canvas", iconFg: "text-[var(--accent-teal)]" },
  productivity: { iconBg: "bg-canvas", iconFg: "text-[var(--accent-teal)]" },
  other: { iconBg: "bg-canvas", iconFg: "text-[var(--coral)]" },
};
