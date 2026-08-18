import { normalizeHex } from "./conversion";

const NAMED: Record<string, string> = {
  "#000000": "Black",
  "#ffffff": "White",
  "#6366f1": "Indigo",
  "#3b82f6": "Blue",
  "#ec4899": "Pink",
  "#ef4444": "Red",
  "#f97316": "Orange",
  "#eab308": "Yellow",
  "#22c55e": "Green",
  "#14b8a6": "Teal",
  "#06b6d4": "Cyan",
  "#8b5cf6": "Violet",
  "#64748b": "Slate",
  "#cc785c": "Coral",
};

export function colorName(hex: string) {
  const normalized = normalizeHex(hex);
  if (!normalized) return "Custom Color";
  if (NAMED[normalized]) return NAMED[normalized];
  const rgb = {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
  if (rgb.r === rgb.g && rgb.g === rgb.b) return rgb.r < 32 ? "Near Black" : rgb.r > 220 ? "Near White" : "Gray";
  if (rgb.r > 180 && rgb.g < 120 && rgb.b < 120) return "Coral";
  if (rgb.g > rgb.r && rgb.g > rgb.b) return rgb.b > 120 ? "Mint" : "Green";
  if (rgb.b > rgb.r && rgb.b > rgb.g) return "Blue";
  if (rgb.r > 200 && rgb.g > 150 && rgb.b < 120) return "Amber";
  return "Custom Color";
}
