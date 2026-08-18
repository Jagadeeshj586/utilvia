import type { CSSProperties } from "react";
import { hexToRgb, normalizeHex } from "@/lib/color/conversion";

export type GlassConfig = {
  blur: number;
  transparency: number;
  saturation: number;
  tint: string;
  radius: number;
  borderEnabled: boolean;
  borderWidth: number;
  borderOpacity: number;
  shadowEnabled: boolean;
  shadowY: number;
  shadowBlur: number;
  shadowOpacity: number;
};

export type GlassExportFormat = "css" | "tailwind" | "variables";
export type GlassPreviewBg = "gradient" | "photo" | "dark";

export const GLASS_LIMITS = {
  blur: { min: 0, max: 40 },
  transparency: { min: 0, max: 80 },
  saturation: { min: 50, max: 250 },
  radius: { min: 0, max: 48 },
  borderWidth: { min: 0, max: 4 },
  borderOpacity: { min: 0, max: 100 },
  shadowY: { min: 0, max: 40 },
  shadowBlur: { min: 0, max: 60 },
  shadowOpacity: { min: 0, max: 80 },
} as const;

export const DEFAULT_GLASS: GlassConfig = {
  blur: 12,
  transparency: 15,
  saturation: 150,
  tint: "#ffffff",
  radius: 16,
  borderEnabled: true,
  borderWidth: 1,
  borderOpacity: 40,
  shadowEnabled: true,
  shadowY: 4,
  shadowBlur: 25,
  shadowOpacity: 25,
};

export const GLASS_PRESETS: Array<{ id: string; label: string; config: GlassConfig }> = [
  { id: "default", label: "Default Glass", config: { ...DEFAULT_GLASS } },
  {
    id: "frosted-dark",
    label: "Frosted Dark",
    config: {
      blur: 18,
      transparency: 28,
      saturation: 140,
      tint: "#181715",
      radius: 16,
      borderEnabled: true,
      borderWidth: 1,
      borderOpacity: 18,
      shadowEnabled: true,
      shadowY: 8,
      shadowBlur: 32,
      shadowOpacity: 40,
    },
  },
  {
    id: "ice-teal",
    label: "Ice Teal",
    config: {
      blur: 14,
      transparency: 22,
      saturation: 165,
      tint: "#d7efe9",
      radius: 20,
      borderEnabled: true,
      borderWidth: 1,
      borderOpacity: 45,
      shadowEnabled: true,
      shadowY: 6,
      shadowBlur: 28,
      shadowOpacity: 22,
    },
  },
  {
    id: "warm-amber",
    label: "Warm Amber",
    config: {
      blur: 12,
      transparency: 20,
      saturation: 155,
      tint: "#e8a55a",
      radius: 16,
      borderEnabled: true,
      borderWidth: 1,
      borderOpacity: 35,
      shadowEnabled: true,
      shadowY: 4,
      shadowBlur: 24,
      shadowOpacity: 28,
    },
  },
  {
    id: "bold",
    label: "Bold Glass",
    config: {
      blur: 24,
      transparency: 30,
      saturation: 180,
      tint: "#faf9f5",
      radius: 24,
      borderEnabled: true,
      borderWidth: 2,
      borderOpacity: 50,
      shadowEnabled: true,
      shadowY: 10,
      shadowBlur: 40,
      shadowOpacity: 35,
    },
  },
  {
    id: "minimal",
    label: "Minimal",
    config: {
      blur: 8,
      transparency: 10,
      saturation: 120,
      tint: "#ffffff",
      radius: 8,
      borderEnabled: true,
      borderWidth: 1,
      borderOpacity: 22,
      shadowEnabled: false,
      shadowY: 0,
      shadowBlur: 0,
      shadowOpacity: 0,
    },
  },
];

export const PREVIEW_BACKGROUNDS: Array<{ id: GlassPreviewBg; label: string }> = [
  { id: "gradient", label: "Gradient" },
  { id: "photo", label: "Photo" },
  { id: "dark", label: "Dark" },
];

export const EXPORT_FORMATS: Array<{ id: GlassExportFormat; label: string }> = [
  { id: "css", label: "Pure CSS" },
  { id: "tailwind", label: "Tailwind CSS" },
  { id: "variables", label: "CSS Variables" },
];

export function cloneGlass(config: GlassConfig = DEFAULT_GLASS): GlassConfig {
  return { ...config };
}

export function matchPresetId(config: GlassConfig) {
  return GLASS_PRESETS.find((preset) => JSON.stringify(preset.config) === JSON.stringify(config))?.id ?? null;
}

export function formatAlpha(value: number) {
  return (Math.round(value * 100) / 100).toFixed(2);
}

export function tintRgba(hex: string, alpha: number) {
  const rgb = hexToRgb(hex) ?? { r: 255, g: 255, b: 255 };
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${formatAlpha(alpha)})`;
}

export function glassBackground(config: GlassConfig) {
  return tintRgba(config.tint, config.transparency / 100);
}

export function glassBorder(config: GlassConfig) {
  if (!config.borderEnabled || config.borderWidth <= 0) return "none";
  return `${config.borderWidth}px solid ${tintRgba("#ffffff", config.borderOpacity / 100)}`;
}

export function glassShadow(config: GlassConfig) {
  if (!config.shadowEnabled) return "none";
  return `0 ${config.shadowY}px ${config.shadowBlur}px ${tintRgba("#000000", config.shadowOpacity / 100)}`;
}

export function glassFilter(config: GlassConfig) {
  return `blur(${config.blur}px) saturate(${config.saturation}%)`;
}

export function glassPreviewStyle(config: GlassConfig): CSSProperties {
  const filter = glassFilter(config);
  return {
    background: glassBackground(config),
    backdropFilter: filter,
    WebkitBackdropFilter: filter,
    borderRadius: `${config.radius}px`,
    border: glassBorder(config),
    boxShadow: glassShadow(config),
  };
}

function firefoxFallbackAlpha(config: GlassConfig) {
  return Math.min(0.92, Math.max(0.55, config.transparency / 100 + 0.6));
}

export function generateGlassCss(config: GlassConfig) {
  const lines = [
    ".glass {",
    `  background: ${glassBackground(config)};`,
    `  backdrop-filter: ${glassFilter(config)};`,
    `  -webkit-backdrop-filter: ${glassFilter(config)};`,
    `  border-radius: ${config.radius}px;`,
  ];
  if (config.borderEnabled && config.borderWidth > 0) {
    lines.push(`  border: ${glassBorder(config)};`);
  }
  if (config.shadowEnabled) {
    lines.push(`  box-shadow: ${glassShadow(config)};`);
  }
  lines.push("}");
  lines.push("");
  lines.push("/* Firefox fallback (doesn't support backdrop-filter) */");
  lines.push("@supports not (backdrop-filter: blur(1px)) {");
  lines.push("  .glass {");
  lines.push(`    background: ${tintRgba(config.tint, firefoxFallbackAlpha(config))};`);
  lines.push("  }");
  lines.push("}");
  return `${lines.join("\n")}\n`;
}

function compactCss(value: string) {
  return value.replace(/, /g, ",");
}

export function generateGlassTailwind(config: GlassConfig) {
  const rgb = hexToRgb(config.tint) ?? { r: 255, g: 255, b: 255 };
  const isWhite = rgb.r === 255 && rgb.g === 255 && rgb.b === 255;
  const bg = isWhite
    ? `bg-white/${Math.round(config.transparency)}`
    : `bg-[${compactCss(glassBackground(config))}]`;
  const classes = [
    bg,
    `backdrop-blur-[${config.blur}px]`,
    `backdrop-saturate-[${config.saturation}%]`,
    `rounded-[${config.radius}px]`,
  ];
  if (config.borderEnabled && config.borderWidth > 0) {
    classes.push(`border-[${config.borderWidth}px]`);
    classes.push(`border-[${compactCss(tintRgba("#ffffff", config.borderOpacity / 100))}]`);
  }
  if (config.shadowEnabled) {
    classes.push(`shadow-[${compactCss(glassShadow(config)).replace(/ /g, "_")}]`);
  }
  return `${classes.join(" ")}\n`;
}

export function generateGlassVariables(config: GlassConfig) {
  const lines = [
    ":root {",
    `  --glass-bg: ${glassBackground(config)};`,
    `  --glass-blur: ${config.blur}px;`,
    `  --glass-saturate: ${config.saturation}%;`,
    `  --glass-radius: ${config.radius}px;`,
  ];
  if (config.borderEnabled && config.borderWidth > 0) {
    lines.push(`  --glass-border: ${glassBorder(config)};`);
  }
  if (config.shadowEnabled) {
    lines.push(`  --glass-shadow: ${glassShadow(config)};`);
  }
  lines.push("}");
  lines.push("");
  lines.push(".glass {");
  lines.push("  background: var(--glass-bg);");
  lines.push("  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));");
  lines.push("  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));");
  lines.push("  border-radius: var(--glass-radius);");
  if (config.borderEnabled && config.borderWidth > 0) {
    lines.push("  border: var(--glass-border);");
  }
  if (config.shadowEnabled) {
    lines.push("  box-shadow: var(--glass-shadow);");
  }
  lines.push("}");
  return `${lines.join("\n")}\n`;
}

export function generateGlassOutput(config: GlassConfig, format: GlassExportFormat) {
  if (format === "tailwind") return generateGlassTailwind(config);
  if (format === "variables") return generateGlassVariables(config);
  return generateGlassCss(config);
}

export function normalizeTint(value: string) {
  const hex = normalizeHex(value);
  if (!hex) return null;
  return `#${hex.slice(1, 7)}`;
}

export function isValidTint(value: string) {
  return Boolean(normalizeTint(value));
}

export const GLASS_FAQS = [
  {
    question: "What CSS property creates the glassmorphism effect?",
    answer:
      "backdrop-filter: blur() plus a semi-transparent background. Saturation on the filter makes colors behind the glass look more vivid. A light border and soft shadow finish the frosted-glass look.",
  },
  {
    question: "Does glassmorphism work in Firefox?",
    answer:
      "Firefox still has limited backdrop-filter support in some setups. The Pure CSS export includes an @supports fallback that uses a more opaque background when blur is not available.",
  },
  {
    question: "How do I add glassmorphism in Tailwind CSS?",
    answer:
      "Copy the Tailwind tab. It uses arbitrary values such as backdrop-blur-[12px] and bg-[rgba(...)] so the classes match the preview without a custom plugin.",
  },
  {
    question: "Is glassmorphism bad for performance?",
    answer:
      "Large blurred areas can be expensive to paint. Keep blur moderate, avoid stacking many glass layers, and test on lower-end devices. Prefer this effect on cards, nav bars, and modals rather than full-page backgrounds.",
  },
  {
    question: "Is this generator free?",
    answer: "Yes. It runs in your browser with no signup. Colors and CSS stay on your device.",
  },
] as const;
