import {
  clamp,
  cssHsla,
  cssRgba,
  hexToRgb,
  hslToRgb,
  normalizeHex,
  rgbToHex,
  rgbToHsl,
} from "@/lib/color/conversion";

export type GradientType = "linear" | "radial" | "conic";
export type ColorFormat = "hex" | "rgb" | "hsl";
export type RadialShape = "circle" | "ellipse";

export type ColorStop = {
  id: string;
  color: string;
  opacity: number;
  position: number;
};

export type GradientConfig = {
  type: GradientType;
  angle: number;
  repeating: boolean;
  radialShape: RadialShape;
  at: string;
  stops: ColorStop[];
  colorFormat: ColorFormat;
};

export type GradientValidation = {
  stops?: string;
  angle?: string;
  color?: string;
};

export const MIN_STOPS = 2;
export const MAX_STOPS = 12;

export const GRADIENT_TYPES: Array<{ id: GradientType; label: string; hint: string }> = [
  { id: "linear", label: "Linear", hint: "Blend along a straight line at the chosen angle." },
  { id: "radial", label: "Radial", hint: "Blend outward from a point, as a circle or ellipse." },
  { id: "conic", label: "Conic", hint: "Sweep colors around a center, like a color wheel." },
];

export const COLOR_FORMATS: Array<{ id: ColorFormat; label: string; hint: string }> = [
  { id: "hex", label: "HEX", hint: "CSS hex, including 8-digit hex when opacity is below 100%." },
  { id: "rgb", label: "RGB", hint: "rgb() or rgba() values." },
  { id: "hsl", label: "HSL", hint: "hsl() or hsla() values." },
];

export const ANGLE_PRESETS: Array<{ angle: number; label: string; hint: string }> = [
  { angle: 0, label: "↑", hint: "To top (0°)" },
  { angle: 45, label: "↗", hint: "To top right (45°)" },
  { angle: 90, label: "→", hint: "To right (90°)" },
  { angle: 135, label: "↘", hint: "To bottom right (135°)" },
  { angle: 180, label: "↓", hint: "To bottom (180°)" },
  { angle: 225, label: "↙", hint: "To bottom left (225°)" },
  { angle: 270, label: "←", hint: "To left (270°)" },
  { angle: 315, label: "↖", hint: "To top left (315°)" },
];

export const POSITION_OPTIONS = [
  "center",
  "top",
  "right",
  "bottom",
  "left",
  "top left",
  "top right",
  "bottom left",
  "bottom right",
] as const;

export const DEFAULT_GRADIENT: GradientConfig = {
  type: "linear",
  angle: 135,
  repeating: false,
  radialShape: "ellipse",
  at: "center",
  stops: [
    { id: "s1", color: "#cc785c", opacity: 1, position: 0 },
    { id: "s2", color: "#e8a55a", opacity: 1, position: 100 },
  ],
  colorFormat: "hex",
};

export const GRADIENT_PRESETS: Array<{ id: string; name: string; config: GradientConfig }> = [
  {
    id: "coral-amber",
    name: "Coral amber",
    config: { ...DEFAULT_GRADIENT },
  },
  {
    id: "warm-wash",
    name: "Warm wash",
    config: {
      ...DEFAULT_GRADIENT,
      angle: 160,
      stops: [
        { id: "s1", color: "#faf9f5", opacity: 1, position: 0 },
        { id: "s2", color: "#cc785c", opacity: 1, position: 55 },
        { id: "s3", color: "#e8a55a", opacity: 1, position: 100 },
      ],
    },
  },
  {
    id: "ink-coral",
    name: "Ink coral",
    config: {
      ...DEFAULT_GRADIENT,
      angle: 125,
      stops: [
        { id: "s1", color: "#181715", opacity: 1, position: 0 },
        { id: "s2", color: "#a9583e", opacity: 1, position: 100 },
      ],
    },
  },
  {
    id: "cream-teal",
    name: "Cream teal",
    config: {
      ...DEFAULT_GRADIENT,
      angle: 90,
      stops: [
        { id: "s1", color: "#faf9f5", opacity: 1, position: 0 },
        { id: "s2", color: "#5db8a6", opacity: 0.85, position: 100 },
      ],
    },
  },
  {
    id: "sunset-band",
    name: "Sunset band",
    config: {
      ...DEFAULT_GRADIENT,
      angle: 180,
      stops: [
        { id: "s1", color: "#e8a55a", opacity: 1, position: 0 },
        { id: "s2", color: "#cc785c", opacity: 1, position: 50 },
        { id: "s3", color: "#252320", opacity: 1, position: 100 },
      ],
    },
  },
  {
    id: "radial-glow",
    name: "Radial glow",
    config: {
      ...DEFAULT_GRADIENT,
      type: "radial",
      radialShape: "circle",
      at: "center",
      stops: [
        { id: "s1", color: "#e8a55a", opacity: 1, position: 0 },
        { id: "s2", color: "#cc785c", opacity: 0.9, position: 45 },
        { id: "s3", color: "#181715", opacity: 1, position: 100 },
      ],
    },
  },
  {
    id: "conic-warm",
    name: "Conic warm",
    config: {
      ...DEFAULT_GRADIENT,
      type: "conic",
      angle: 0,
      at: "center",
      stops: [
        { id: "s1", color: "#cc785c", opacity: 1, position: 0 },
        { id: "s2", color: "#e8a55a", opacity: 1, position: 33 },
        { id: "s3", color: "#5db8a6", opacity: 1, position: 66 },
        { id: "s4", color: "#cc785c", opacity: 1, position: 100 },
      ],
    },
  },
  {
    id: "soft-veil",
    name: "Soft veil",
    config: {
      ...DEFAULT_GRADIENT,
      angle: 45,
      stops: [
        { id: "s1", color: "#cc785c", opacity: 0.15, position: 0 },
        { id: "s2", color: "#e8a55a", opacity: 0.45, position: 50 },
        { id: "s3", color: "#5db8a6", opacity: 0.2, position: 100 },
      ],
    },
  },
];

export const CSS_GRADIENT_FAQS = [
  {
    question: "What CSS gradient types can I generate?",
    answer:
      "Linear, radial, and conic — including repeating variants. Linear blends along an angle, radial from a point, and conic around a center.",
  },
  {
    question: "How do color stops work?",
    answer:
      "Each stop is a color, opacity, and position from 0% to 100%. Drag stops on the bar, or edit them in the list. You can add up to 12 stops and must keep at least two.",
  },
  {
    question: "Can I copy HEX, RGB, or HSL?",
    answer:
      "Yes. Switch the color format to change both the stop fields and the generated CSS. Opacity below 100% uses hex-alpha, rgba(), or hsla().",
  },
  {
    question: "Does the preview match the copied CSS?",
    answer:
      "The live preview uses the same gradient value as the CSS snippet. Paste `background: …` into a stylesheet or inline style.",
  },
  {
    question: "Is the CSS Gradient Generator free?",
    answer: "Yes. It runs in your browser with no signup. Colors and CSS stay on your device.",
  },
] as const;

export function cloneGradient(config: GradientConfig = DEFAULT_GRADIENT): GradientConfig {
  return {
    ...config,
    stops: config.stops.map((stop) => ({ ...stop })),
  };
}

export function createStopId() {
  return `stop-${Math.random().toString(36).slice(2, 10)}`;
}

export function sortStops(stops: ColorStop[]) {
  return [...stops].sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
}

export function formatStopColor(stop: ColorStop, format: ColorFormat) {
  const rgb = hexToRgb(stop.color);
  if (!rgb) return stop.color;
  const opacity = clamp(stop.opacity, 0, 1);
  if (format === "rgb") return cssRgba(rgb, opacity);
  if (format === "hsl") return cssHsla(rgbToHsl(rgb.r, rgb.g, rgb.b), opacity);
  return rgbToHex(rgb.r, rgb.g, rgb.b, opacity);
}

export function parseColorInput(raw: string): { color: string; opacity: number } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const hex = normalizeHex(trimmed);
  if (hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    const opacity =
      hex.length === 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1;
    return { color: rgbToHex(rgb.r, rgb.g, rgb.b), opacity: clamp(opacity, 0, 1) };
  }

  const rgbMatch = trimmed.match(
    /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i,
  );
  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    if (![r, g, b].every((value) => Number.isFinite(value) && value >= 0 && value <= 255)) return null;
    return { color: rgbToHex(r, g, b), opacity: parseAlphaToken(rgbMatch[4]) };
  }

  const hslMatch = trimmed.match(
    /^hsla?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i,
  );
  if (hslMatch) {
    const h = Number(hslMatch[1]);
    const s = Number(hslMatch[2]);
    const l = Number(hslMatch[3]);
    if (![h, s, l].every(Number.isFinite) || s < 0 || s > 100 || l < 0 || l > 100) return null;
    const rgb = hslToRgb(h, s, l);
    return { color: rgbToHex(rgb.r, rgb.g, rgb.b), opacity: parseAlphaToken(hslMatch[4]) };
  }

  return null;
}

function parseAlphaToken(token?: string) {
  if (token == null || token === "") return 1;
  const percent = token.endsWith("%");
  const value = Number(percent ? token.slice(0, -1) : token);
  if (!Number.isFinite(value)) return 1;
  return clamp(percent ? value / 100 : value, 0, 1);
}

export function interpolateAt(stops: ColorStop[], position: number) {
  const sorted = sortStops(stops);
  const pos = clamp(position, 0, 100);
  if (sorted.length === 0) return { color: "#cc785c", opacity: 1 };
  if (pos <= sorted[0].position) return { color: sorted[0].color, opacity: sorted[0].opacity };
  const last = sorted[sorted.length - 1];
  if (pos >= last.position) return { color: last.color, opacity: last.opacity };

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const from = sorted[index];
    const to = sorted[index + 1];
    if (pos < from.position || pos > to.position) continue;
    const span = to.position - from.position;
    const t = span < 0.001 ? 0 : (pos - from.position) / span;
    const a = hexToRgb(from.color);
    const b = hexToRgb(to.color);
    if (!a || !b) return { color: from.color, opacity: from.opacity };
    return {
      color: rgbToHex(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t),
      opacity: from.opacity + (to.opacity - from.opacity) * t,
    };
  }

  return { color: last.color, opacity: last.opacity };
}

export function nextStopPosition(stops: ColorStop[]) {
  const sorted = sortStops(stops);
  if (sorted.length < 2) return 50;
  let bestGap = 0;
  let position = 50;
  for (let index = 0; index < sorted.length - 1; index += 1) {
    const gap = sorted[index + 1].position - sorted[index].position;
    if (gap > bestGap) {
      bestGap = gap;
      position = sorted[index].position + gap / 2;
    }
  }
  return Math.round(position * 10) / 10;
}

export function addStop(config: GradientConfig, position?: number): GradientConfig | { error: string } {
  if (config.stops.length >= MAX_STOPS) return { error: `Keep ${MAX_STOPS} stops or fewer.` };
  const pos = position ?? nextStopPosition(config.stops);
  const mixed = interpolateAt(config.stops, pos);
  return {
    ...config,
    stops: [
      ...config.stops,
      {
        id: createStopId(),
        color: mixed.color,
        opacity: Math.round(mixed.opacity * 1000) / 1000,
        position: Math.round(clamp(pos, 0, 100) * 10) / 10,
      },
    ],
  };
}

export function removeStop(config: GradientConfig, id: string): GradientConfig | { error: string } {
  if (config.stops.length <= MIN_STOPS) return { error: `Keep at least ${MIN_STOPS} color stops.` };
  if (!config.stops.some((stop) => stop.id === id)) return { error: "Stop not found." };
  return { ...config, stops: config.stops.filter((stop) => stop.id !== id) };
}

export function colorInputIncludesAlpha(raw: string) {
  const hex = normalizeHex(raw.trim());
  if (hex?.length === 9) return true;
  const value = raw.trim();
  return /^(rgba|hsla)\(/i.test(value) || /\/\s*[\d.]+%?\s*\)$/i.test(value);
}

export function updateStop(config: GradientConfig, id: string, patch: Partial<Omit<ColorStop, "id">>): GradientConfig {
  return {
    ...config,
    stops: config.stops.map((stop) => {
      if (stop.id !== id) return stop;
      const next = { ...stop };
      if (patch.color != null) {
        const parsed = parseColorInput(patch.color);
        if (parsed) {
          next.color = parsed.color;
          if (colorInputIncludesAlpha(patch.color)) next.opacity = parsed.opacity;
        }
      }
      if (patch.position != null) next.position = Math.round(clamp(patch.position, 0, 100) * 10) / 10;
      if (patch.opacity != null) next.opacity = Math.round(clamp(patch.opacity, 0, 1) * 1000) / 1000;
      return next;
    }),
  };
}

export function moveStop(config: GradientConfig, id: string, direction: -1 | 1): GradientConfig {
  const sorted = sortStops(config.stops);
  const index = sorted.findIndex((stop) => stop.id === id);
  const neighbor = sorted[index + direction];
  if (index < 0 || !neighbor) return config;
  return {
    ...config,
    stops: config.stops.map((stop) => {
      if (stop.id === id) return { ...stop, position: neighbor.position };
      if (stop.id === neighbor.id) return { ...stop, position: sorted[index].position };
      return stop;
    }),
  };
}

export function gradientFunction(config: GradientConfig) {
  const stops = sortStops(config.stops)
    .map((stop) => `${formatStopColor(stop, config.colorFormat)} ${roundPos(stop.position)}%`)
    .join(", ");
  const prefix = config.repeating ? "repeating-" : "";

  if (config.type === "radial") {
    return `${prefix}radial-gradient(${config.radialShape} at ${config.at}, ${stops})`;
  }
  if (config.type === "conic") {
    return `${prefix}conic-gradient(from ${normalizeAngle(config.angle)}deg at ${config.at}, ${stops})`;
  }
  return `${prefix}linear-gradient(${normalizeAngle(config.angle)}deg, ${stops})`;
}

export function generateCss(config: GradientConfig) {
  return `background: ${gradientFunction(config)};`;
}

export function validateGradient(config: GradientConfig): GradientValidation {
  const errors: GradientValidation = {};
  if (config.stops.length < MIN_STOPS) errors.stops = `Add at least ${MIN_STOPS} color stops.`;
  if (config.stops.length > MAX_STOPS) errors.stops = `Keep ${MAX_STOPS} stops or fewer.`;
  if (config.stops.some((stop) => !hexToRgb(stop.color))) errors.color = "Each stop needs a valid color.";
  if (!Number.isFinite(config.angle) || config.angle < 0 || config.angle > 360) {
    errors.angle = "Angle should be between 0° and 360°.";
  }
  return errors;
}

export function hasGradientErrors(errors: GradientValidation) {
  return Object.values(errors).some(Boolean);
}

function normalizeAngle(angle: number) {
  if (!Number.isFinite(angle)) return 0;
  const wrapped = ((angle % 360) + 360) % 360;
  return Math.round(wrapped * 10) / 10;
}

function roundPos(value: number) {
  const rounded = Math.round(clamp(value, 0, 100) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
