export type SvgDimensions = {
  width: number;
  height: number;
};

export type SvgOutputSizeInput = {
  baseWidth: number;
  baseHeight: number;
  scale: number;
  customWidthEnabled: boolean;
  customWidth: string;
};

export const SVG_TO_PNG_SCALES = [1, 2, 4] as const;

export const SVG_TO_PNG_FAQS = [
  {
    question: "Why convert SVG to PNG?",
    answer: "Many platforms don't support SVG and require a raster format like PNG.",
  },
  {
    question: "What resolution should I pick?",
    answer: "Export at the largest size you need — PNG can't be upscaled cleanly later.",
  },
  {
    question: "Does PNG support transparency?",
    answer: "Yes — choose transparent background to preserve it.",
  },
  {
    question: "Will SVG text render correctly?",
    answer: "Usually yes if fonts are embedded or available in the browser.",
  },
  {
    question: "Is SVG to PNG free?",
    answer: "Yes. The Utilvia SVG to PNG converter is free with no signup.",
  },
] as const;

/** Match WorkUtilities: prefer viewBox, then width/height attrs, else 512×512. */
export function parseSvgDimensions(svg: string): SvgDimensions {
  const viewBox = svg.match(/viewBox=["']([^"']+)["']/i);
  if (viewBox) {
    const parts = viewBox[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      return { width: parts[2], height: parts[3] };
    }
  }

  const widthMatch = svg.match(/\bwidth=["'](\d+(?:\.\d+)?)/i);
  const heightMatch = svg.match(/\bheight=["'](\d+(?:\.\d+)?)/i);
  return {
    width: widthMatch ? parseFloat(widthMatch[1]) : 512,
    height: heightMatch ? parseFloat(heightMatch[1]) : 512,
  };
}

export function resolveOutputSize(input: SvgOutputSizeInput): SvgDimensions {
  const { baseWidth, baseHeight, scale, customWidthEnabled, customWidth } = input;
  if (customWidthEnabled && customWidth) {
    const width = parseInt(customWidth, 10);
    if (Number.isFinite(width) && width > 0 && baseWidth > 0) {
      return {
        width,
        height: Math.round((width / baseWidth) * baseHeight),
      };
    }
  }

  return {
    width: Math.round(baseWidth * scale),
    height: Math.round(baseHeight * scale),
  };
}
