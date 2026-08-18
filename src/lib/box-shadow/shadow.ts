import { cssHsla, cssRgba, hexToRgb, rgbToHex, rgbToHsl } from "@/lib/color/conversion";
import { parseColorInput, type ColorFormat } from "@/lib/css-gradient/gradient";

export type { ColorFormat };

export type ShadowLayer = {
  id: string;
  inset: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
};

export type ShadowConfig = {
  layers: ShadowLayer[];
  colorFormat: ColorFormat;
};

export type ShadowPreview = {
  background: ShadowPreviewBg;
  width: number;
  height: number;
  radius: number;
  elementColor: string;
};

export type ShadowPreviewBg = "cream" | "soft" | "dark" | "checker";

export const SHADOW_LIMITS = {
  offset: { min: -100, max: 100 },
  blur: { min: 0, max: 120 },
  spread: { min: -50, max: 80 },
  opacity: { min: 0, max: 100 },
  previewSize: { min: 80, max: 360 },
  radius: { min: 0, max: 48 },
  minLayers: 1,
  maxLayers: 8,
} as const;

export const COLOR_FORMATS: Array<{ id: ColorFormat; label: string; hint: string }> = [
  { id: "hex", label: "HEX", hint: "CSS hex, including 8-digit hex when opacity is below 100%." },
  { id: "rgb", label: "RGB", hint: "rgb() or rgba() values." },
  { id: "hsl", label: "HSL", hint: "hsl() or hsla() values." },
];

export const PREVIEW_BACKGROUNDS: Array<{ id: ShadowPreviewBg; label: string }> = [
  { id: "cream", label: "Cream" },
  { id: "soft", label: "Soft" },
  { id: "dark", label: "Dark" },
  { id: "checker", label: "Checker" },
];

function layer(
  id: string,
  partial: Partial<Omit<ShadowLayer, "id">> & Pick<ShadowLayer, "offsetY" | "blur">,
): ShadowLayer {
  return {
    inset: false,
    offsetX: 0,
    spread: 0,
    color: "#141413",
    opacity: 12,
    ...partial,
    id,
  };
}

export const DEFAULT_LAYER: ShadowLayer = layer("layer-1", {
  offsetY: 8,
  blur: 24,
  opacity: 12,
});

export const DEFAULT_SHADOW: ShadowConfig = {
  layers: [{ ...DEFAULT_LAYER }],
  colorFormat: "hex",
};

export const DEFAULT_PREVIEW: ShadowPreview = {
  background: "cream",
  width: 180,
  height: 112,
  radius: 12,
  elementColor: "#ffffff",
};

export const SHADOW_PRESETS: Array<{ id: string; label: string; config: ShadowConfig }> = [
  {
    id: "soft",
    label: "Soft",
    config: { colorFormat: "hex", layers: [{ ...DEFAULT_LAYER }] },
  },
  {
    id: "card",
    label: "Card",
    config: {
      colorFormat: "hex",
      layers: [layer("layer-1", { offsetY: 4, blur: 16, spread: -2, opacity: 10 })],
    },
  },
  {
    id: "lifted",
    label: "Lifted",
    config: {
      colorFormat: "hex",
      layers: [layer("layer-1", { offsetY: 18, blur: 40, spread: -8, opacity: 18 })],
    },
  },
  {
    id: "sharp",
    label: "Sharp",
    config: {
      colorFormat: "hex",
      layers: [layer("layer-1", { offsetX: 6, offsetY: 6, blur: 0, opacity: 22 })],
    },
  },
  {
    id: "coral-glow",
    label: "Coral glow",
    config: {
      colorFormat: "hex",
      layers: [layer("layer-1", { offsetY: 10, blur: 28, color: "#cc785c", opacity: 42 })],
    },
  },
  {
    id: "inset",
    label: "Inset",
    config: {
      colorFormat: "hex",
      layers: [layer("layer-1", { inset: true, offsetY: 2, blur: 8, opacity: 16 })],
    },
  },
  {
    id: "layered",
    label: "Layered",
    config: {
      colorFormat: "hex",
      layers: [
        layer("layer-1", { offsetY: 1, blur: 2, opacity: 8 }),
        layer("layer-2", { offsetY: 8, blur: 24, opacity: 12 }),
      ],
    },
  },
  {
    id: "amber-ring",
    label: "Amber ring",
    config: {
      colorFormat: "hex",
      layers: [
        layer("layer-1", { offsetY: 0, blur: 0, spread: 2, color: "#e8a55a", opacity: 55 }),
        layer("layer-2", { offsetY: 10, blur: 22, color: "#141413", opacity: 12 }),
      ],
    },
  },
];

export function createLayerId() {
  return `layer-${Math.random().toString(36).slice(2, 10)}`;
}

export function cloneShadow(config: ShadowConfig = DEFAULT_SHADOW): ShadowConfig {
  return {
    colorFormat: config.colorFormat,
    layers: config.layers.map((item) => ({ ...item })),
  };
}

export function clonePreview(preview: ShadowPreview = DEFAULT_PREVIEW): ShadowPreview {
  return { ...preview };
}

function clampInt(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function clampLayer(layerInput: ShadowLayer): ShadowLayer {
  return {
    ...layerInput,
    offsetX: clampInt(layerInput.offsetX, SHADOW_LIMITS.offset.min, SHADOW_LIMITS.offset.max),
    offsetY: clampInt(layerInput.offsetY, SHADOW_LIMITS.offset.min, SHADOW_LIMITS.offset.max),
    blur: clampInt(layerInput.blur, SHADOW_LIMITS.blur.min, SHADOW_LIMITS.blur.max),
    spread: clampInt(layerInput.spread, SHADOW_LIMITS.spread.min, SHADOW_LIMITS.spread.max),
    opacity: clampInt(layerInput.opacity, SHADOW_LIMITS.opacity.min, SHADOW_LIMITS.opacity.max),
    color: hexToRgb(layerInput.color) ? layerInput.color.toLowerCase() : "#141413",
    inset: Boolean(layerInput.inset),
  };
}

export function formatPx(value: number) {
  return `${Math.round(value)}px`;
}

export function formatLayerColor(item: ShadowLayer, format: ColorFormat) {
  const rgb = hexToRgb(item.color) ?? { r: 20, g: 20, b: 19 };
  const alpha = clampInt(item.opacity, 0, 100) / 100;
  if (format === "rgb") return cssRgba(rgb, alpha);
  if (format === "hsl") return cssHsla(rgbToHsl(rgb.r, rgb.g, rgb.b), alpha);
  return rgbToHex(rgb.r, rgb.g, rgb.b, alpha);
}

export function formatLayer(item: ShadowLayer, format: ColorFormat) {
  const clamped = clampLayer(item);
  const parts = [
    formatPx(clamped.offsetX),
    formatPx(clamped.offsetY),
    formatPx(clamped.blur),
    formatPx(clamped.spread),
    formatLayerColor(clamped, format),
  ];
  if (clamped.inset) parts.unshift("inset");
  return parts.join(" ");
}

export function boxShadowValue(config: ShadowConfig) {
  return config.layers.map((item) => formatLayer(item, config.colorFormat)).join(", ");
}

export function generateShadowCss(config: ShadowConfig) {
  const layers = config.layers.map((item) => formatLayer(item, config.colorFormat));
  if (layers.length <= 1) {
    return `.element {\n  box-shadow: ${layers[0] ?? "none"};\n}\n`;
  }
  const body = layers.map((item, index) => `    ${item}${index === layers.length - 1 ? ";" : ","}`).join("\n");
  return `.element {\n  box-shadow:\n${body}\n}\n`;
}

export function addLayer(config: ShadowConfig): ShadowConfig | { error: string } {
  if (config.layers.length >= SHADOW_LIMITS.maxLayers) {
    return { error: `You can add up to ${SHADOW_LIMITS.maxLayers} shadow layers.` };
  }
  const source = config.layers[config.layers.length - 1] ?? DEFAULT_LAYER;
  const next: ShadowLayer = clampLayer({
    ...source,
    id: createLayerId(),
    offsetY: source.offsetY + 4,
    blur: source.blur + 8,
    opacity: Math.max(6, source.opacity - 2),
  });
  return { ...config, layers: [...config.layers, next] };
}

export function removeLayer(config: ShadowConfig, id: string): ShadowConfig | { error: string } {
  if (config.layers.length <= SHADOW_LIMITS.minLayers) {
    return { error: "Keep at least one shadow layer." };
  }
  if (!config.layers.some((item) => item.id === id)) {
    return { error: "That layer is no longer in the list." };
  }
  return { ...config, layers: config.layers.filter((item) => item.id !== id) };
}

export function moveLayer(config: ShadowConfig, id: string, direction: -1 | 1): ShadowConfig {
  const index = config.layers.findIndex((item) => item.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= config.layers.length) return config;
  const layers = [...config.layers];
  const [moved] = layers.splice(index, 1);
  layers.splice(nextIndex, 0, moved);
  return { ...config, layers };
}

export function updateLayer(
  config: ShadowConfig,
  id: string,
  patch: Partial<Omit<ShadowLayer, "id">>,
): ShadowConfig {
  return {
    ...config,
    layers: config.layers.map((item) => (item.id === id ? clampLayer({ ...item, ...patch }) : item)),
  };
}

export function parseLayerColor(raw: string): { color: string; opacity: number } | null {
  const parsed = parseColorInput(raw);
  if (!parsed) return null;
  return { color: parsed.color, opacity: Math.round(parsed.opacity * 100) };
}

export function validateShadow(config: ShadowConfig) {
  const errors: { layers?: string; color?: string } = {};
  if (config.layers.length < SHADOW_LIMITS.minLayers || config.layers.length > SHADOW_LIMITS.maxLayers) {
    errors.layers = `Use between ${SHADOW_LIMITS.minLayers} and ${SHADOW_LIMITS.maxLayers} layers.`;
  }
  if (config.layers.some((item) => !hexToRgb(item.color))) {
    errors.color = "Each layer needs a valid color.";
  }
  return errors;
}

export function hasShadowErrors(errors: ReturnType<typeof validateShadow>) {
  return Object.keys(errors).length > 0;
}

function layerSignature(item: ShadowLayer) {
  const clamped = clampLayer(item);
  return [
    clamped.inset ? "i" : "o",
    clamped.offsetX,
    clamped.offsetY,
    clamped.blur,
    clamped.spread,
    clamped.color.toLowerCase(),
    clamped.opacity,
  ].join(":");
}

export function matchPresetId(config: ShadowConfig) {
  const signature = config.layers.map(layerSignature).join("|");
  return (
    SHADOW_PRESETS.find(
      (preset) => preset.config.layers.map(layerSignature).join("|") === signature,
    )?.id ?? null
  );
}

export const SHADOW_FAQS = [
  {
    question: "What is a CSS box-shadow?",
    answer:
      "box-shadow draws one or more shadows behind or inside an element. Each layer has horizontal and vertical offset, blur, spread, color, and an optional inset keyword.",
  },
  {
    question: "How do multiple shadow layers work?",
    answer: `The first layer is drawn on top. Add up to ${SHADOW_LIMITS.maxLayers} layers for stacked depth — for example a tight contact shadow plus a softer lift. Reorder layers to change which one sits in front.`,
  },
  {
    question: "What is the difference between inset and outer shadows?",
    answer:
      "An outer shadow falls outside the box. Inset draws the shadow inside the border, useful for pressed buttons and wells.",
  },
  {
    question: "Can I copy HEX, RGB, or HSL?",
    answer:
      "Yes. Switch the color format to change both the color field and the generated CSS. Opacity below 100% uses 8-digit hex, rgba(), or hsla().",
  },
  {
    question: "Is the Box Shadow Generator free?",
    answer: "Yes. It runs in your browser with no signup. Colors and CSS stay on your device.",
  },
] as const;
