export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };
export type HSV = { h: number; s: number; v: number };
export type CMYK = { c: number; m: number; y: number; k: number };

export type ColorFormats = {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  hsv: HSV;
  cmyk: CMYK;
  alpha: number;
};

export type StoredColor = {
  hex: string;
  alpha: number;
  name?: string;
  savedAt: number;
};
