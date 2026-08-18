export type AspectRatioPreset = {
  label: string;
  name: string;
  w: number;
  h: number;
  width: number;
  height: number;
};

export type PopularResolution = {
  label: string;
  width: number;
  height: number;
};

export const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
  { label: "1:1", name: "Square", w: 1, h: 1, width: 1080, height: 1080 },
  { label: "4:3", name: "Standard", w: 4, h: 3, width: 1440, height: 1080 },
  { label: "3:2", name: "Photography", w: 3, h: 2, width: 1500, height: 1000 },
  { label: "16:9", name: "Widescreen", w: 16, h: 9, width: 1920, height: 1080 },
  { label: "16:10", name: "Widescreen", w: 16, h: 10, width: 1920, height: 1200 },
  { label: "21:9", name: "Ultrawide", w: 21, h: 9, width: 2560, height: 1080 },
  { label: "9:16", name: "Vertical", w: 9, h: 16, width: 1080, height: 1920 },
  { label: "4:5", name: "Instagram Portrait", w: 4, h: 5, width: 1080, height: 1350 },
  { label: "5:4", name: "5:4", w: 5, h: 4, width: 1280, height: 1024 },
  { label: "3:4", name: "3:4", w: 3, h: 4, width: 1080, height: 1440 },
  { label: "2:3", name: "2:3", w: 2, h: 3, width: 1000, height: 1500 },
];

export const POPULAR_RESOLUTIONS: PopularResolution[] = [
  { label: "HD", width: 1280, height: 720 },
  { label: "Full HD", width: 1920, height: 1080 },
  { label: "2K", width: 2560, height: 1440 },
  { label: "4K UHD", width: 3840, height: 2160 },
  { label: "8K UHD", width: 7680, height: 4320 },
  { label: "Instagram Square", width: 1080, height: 1080 },
  { label: "Instagram Portrait", width: 1080, height: 1350 },
  { label: "Instagram Story", width: 1080, height: 1920 },
  { label: "YouTube Thumbnail", width: 1280, height: 720 },
  { label: "LinkedIn Post", width: 1200, height: 627 },
  { label: "Facebook Post", width: 1200, height: 630 },
  { label: "X/Twitter Post", width: 1600, height: 900 },
];

export function calculateGcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

export function simplifyRatio(width: number, height: number) {
  const g = calculateGcd(width, height);
  const w = Math.round(width) / g;
  const h = Math.round(height) / g;
  return { w, h, label: `${w}:${h}` };
}

export function formatDecimal(value: number) {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value * 10000) / 10000;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

export function calculateAspectRatio(width: number, height: number) {
  const simplified = simplifyRatio(width, height);
  return {
    simplified: simplified.label,
    ratioW: simplified.w,
    ratioH: simplified.h,
    decimal: width / height,
  };
}

export function calculateHeight(originalWidth: number, originalHeight: number, targetWidth: number) {
  return (targetWidth * originalHeight) / originalWidth;
}

export function calculateWidth(originalWidth: number, originalHeight: number, targetHeight: number) {
  return (targetHeight * originalWidth) / originalHeight;
}

export function parseDimension(value: string): { value: number | null; error: string | null } {
  const trimmed = value.trim();
  if (!trimmed) return { value: null, error: null };
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return { value: null, error: "Enter a valid number." };
  if (num <= 0) return { value: null, error: "Enter a value greater than 0." };
  return { value: num, error: null };
}

export function dimensionFromRatio(ratioW: number, ratioH: number, width?: number, height?: number) {
  if (width && width > 0) return { width, height: (width * ratioH) / ratioW };
  if (height && height > 0) return { width: (height * ratioW) / ratioH, height };
  return null;
}

export const ASPECT_RATIO_FAQS = [
  {
    question: "What is an aspect ratio?",
    answer:
      "Aspect ratio is the proportional relationship between width and height, written as width:height such as 16:9 or 4:3.",
  },
  {
    question: "How do I calculate an aspect ratio?",
    answer: "Enter the width and height. The calculator divides both by their greatest common divisor to simplify the ratio.",
  },
  {
    question: "What is the difference between 16:9 and 4:3?",
    answer: "16:9 is wider and common for video and displays. 4:3 is taller and was standard for older TVs and monitors.",
  },
  {
    question: "How do I resize an image without distortion?",
    answer: "Keep the same aspect ratio when changing width or height. Use Calculate Height or Calculate Width to find the matching dimension.",
  },
  {
    question: "What is the most common aspect ratio?",
    answer: "16:9 is the most common widescreen ratio for video, streaming, and modern displays.",
  },
  {
    question: "What aspect ratio is used for Instagram?",
    answer: "Instagram square posts use 1:1, portrait feed posts often use 4:5, and Stories/Reels use 9:16.",
  },
  {
    question: "What aspect ratio is used for YouTube?",
    answer: "YouTube videos are typically 16:9. Thumbnails are commonly 1280×720, which is also 16:9.",
  },
] as const;
