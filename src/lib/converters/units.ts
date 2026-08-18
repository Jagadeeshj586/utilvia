export type UnitCategoryId =
  | "length"
  | "weight"
  | "temperature"
  | "area"
  | "volume"
  | "speed"
  | "data";

export type UnitDef = {
  id: string;
  label: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
};

export type UnitCategory = {
  id: UnitCategoryId;
  label: string;
  units: UnitDef[];
};

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: "length",
    label: "Length",
    units: [
      { id: "km", label: "Kilometers (km)", toBase: (e) => 1e3 * e, fromBase: (e) => e / 1e3 },
      { id: "m", label: "Meters (m)", toBase: (e) => e, fromBase: (e) => e },
      { id: "cm", label: "Centimeters (cm)", toBase: (e) => e / 100, fromBase: (e) => 100 * e },
      { id: "mi", label: "Miles (mi)", toBase: (e) => 1609.344 * e, fromBase: (e) => e / 1609.344 },
      { id: "ft", label: "Feet (ft)", toBase: (e) => 0.3048 * e, fromBase: (e) => e / 0.3048 },
      { id: "in", label: "Inches (in)", toBase: (e) => 0.0254 * e, fromBase: (e) => e / 0.0254 },
    ],
  },
  {
    id: "weight",
    label: "Weight",
    units: [
      { id: "kg", label: "Kilograms (kg)", toBase: (e) => e, fromBase: (e) => e },
      { id: "g", label: "Grams (g)", toBase: (e) => e / 1e3, fromBase: (e) => 1e3 * e },
      { id: "lb", label: "Pounds (lbs)", toBase: (e) => 0.453592 * e, fromBase: (e) => e / 0.453592 },
      { id: "oz", label: "Ounces (oz)", toBase: (e) => 0.0283495 * e, fromBase: (e) => e / 0.0283495 },
      { id: "t", label: "Metric Tons (t)", toBase: (e) => 1e3 * e, fromBase: (e) => e / 1e3 },
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    units: [
      { id: "c", label: "Celsius (°C)", toBase: (e) => e, fromBase: (e) => e },
      { id: "f", label: "Fahrenheit (°F)", toBase: (e) => ((e - 32) * 5) / 9, fromBase: (e) => (9 * e) / 5 + 32 },
      { id: "k", label: "Kelvin (K)", toBase: (e) => e - 273.15, fromBase: (e) => e + 273.15 },
    ],
  },
  {
    id: "area",
    label: "Area",
    units: [
      { id: "sqm", label: "Square Meters (sq m)", toBase: (e) => e, fromBase: (e) => e },
      { id: "sqft", label: "Square Feet (sq ft)", toBase: (e) => 0.092903 * e, fromBase: (e) => e / 0.092903 },
      { id: "acre", label: "Acres", toBase: (e) => 4046.86 * e, fromBase: (e) => e / 4046.86 },
      { id: "ha", label: "Hectares (ha)", toBase: (e) => 1e4 * e, fromBase: (e) => e / 1e4 },
    ],
  },
  {
    id: "volume",
    label: "Volume",
    units: [
      { id: "l", label: "Liters (L)", toBase: (e) => e, fromBase: (e) => e },
      { id: "ml", label: "Milliliters (mL)", toBase: (e) => e / 1e3, fromBase: (e) => 1e3 * e },
      { id: "gal", label: "US Gallons (gal)", toBase: (e) => 3.78541 * e, fromBase: (e) => e / 3.78541 },
      { id: "cuft", label: "Cubic Feet (cu ft)", toBase: (e) => 28.3168 * e, fromBase: (e) => e / 28.3168 },
    ],
  },
  {
    id: "speed",
    label: "Speed",
    units: [
      { id: "kmh", label: "Kilometers/hour (km/h)", toBase: (e) => e, fromBase: (e) => e },
      { id: "mph", label: "Miles/hour (mph)", toBase: (e) => 1.60934 * e, fromBase: (e) => e / 1.60934 },
      { id: "ms", label: "Meters/second (m/s)", toBase: (e) => 3.6 * e, fromBase: (e) => e / 3.6 },
    ],
  },
  {
    id: "data",
    label: "Data",
    units: [
      { id: "kb", label: "Kilobytes (KB)", toBase: (e) => e, fromBase: (e) => e },
      { id: "mb", label: "Megabytes (MB)", toBase: (e) => 1024 * e, fromBase: (e) => e / 1024 },
      { id: "gb", label: "Gigabytes (GB)", toBase: (e) => 1048576 * e, fromBase: (e) => e / 1048576 },
      { id: "tb", label: "Terabytes (TB)", toBase: (e) => 1073741824 * e, fromBase: (e) => e / 1073741824 },
    ],
  },
];

export function getUnitCategory(id: UnitCategoryId) {
  return UNIT_CATEGORIES.find((category) => category.id === id) ?? UNIT_CATEGORIES[0];
}

export function parseUnitInput(raw: string) {
  const cleaned = raw.replace(/,/g, "").trim();
  if (!cleaned) return NaN;
  return Number(cleaned);
}

export function convertUnits(value: number, fromId: string, toId: string, categoryId: UnitCategoryId) {
  if (!Number.isFinite(value)) return null;
  const category = getUnitCategory(categoryId);
  const from = category.units.find((unit) => unit.id === fromId);
  const to = category.units.find((unit) => unit.id === toId);
  if (!from || !to) return null;
  return to.fromBase(from.toBase(value));
}

export function allConversions(value: number, fromId: string, categoryId: UnitCategoryId) {
  if (!Number.isFinite(value)) return [];
  const category = getUnitCategory(categoryId);
  const from = category.units.find((unit) => unit.id === fromId);
  if (!from) return [];
  const base = from.toBase(value);
  return category.units.map((unit) => ({
    unit,
    value: unit.fromBase(base),
  }));
}

export function formatUnitValue(value: number, categoryId: UnitCategoryId) {
  if (!Number.isFinite(value)) return "—";
  if (categoryId === "temperature") {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
  }
  if (Math.abs(value) >= 1e3) {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 }).format(value);
  }
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 6 }).format(value);
}

export const UNIT_CONVERTER_FAQS = [
  {
    question: "How do I convert km to miles or kg to lbs?",
    answer:
      "Pick Length or Weight, choose the from and to units, then enter a value. The result updates instantly, and All Conversions shows every equivalent in that category.",
  },
  {
    question: "How many square feet in one square meter?",
    answer: "About 10.7639 sq ft. Open the Area category, set From to Square Meters and To to Square Feet, then enter 1.",
  },
  {
    question: "How to convert Celsius to Fahrenheit?",
    answer: "Open Temperature, set From to Celsius and To to Fahrenheit, then enter the temperature. The formula used is °F = (°C × 9/5) + 32.",
  },
  {
    question: "How many liters in a gallon?",
    answer: "One US gallon is about 3.78541 liters. Use the Volume category with US Gallons and Liters.",
  },
  {
    question: "How to convert kg to pounds?",
    answer: "Open Weight, set From to Kilograms and To to Pounds, then enter the mass. One kilogram is about 2.20462 pounds.",
  },
];
