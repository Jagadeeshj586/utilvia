export const FAVICON_SIZES = [16, 32, 180, 192, 512] as const;

export type FaviconSize = (typeof FAVICON_SIZES)[number];

export type FaviconFile = {
  filename: string;
  blob: Blob;
  size: FaviconSize | "ico";
};

export type FaviconPackage = {
  files: FaviconFile[];
  htmlTags: string;
  previewUrl: string;
};

export const FAVICON_HTML_TAGS = `<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">`;

const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export function isAcceptedFaviconImage(file: File) {
  return ACCEPTED_TYPES.has(file.type);
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image"));
    image.src = URL.createObjectURL(file);
  });
}

export async function renderPngAtSize(image: HTMLImageElement, size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(image, 0, 0, size, size);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error("PNG export failed"))), "image/png");
  });
  return new Uint8Array(await blob.arrayBuffer());
}

export function buildIco(entries: Array<{ size: number; data: Uint8Array }>) {
  const count = entries.length;
  const headerSize = 6 + 16 * count;
  const totalDataSize = entries.reduce((sum, entry) => sum + entry.data.length, 0);
  const buffer = new Uint8Array(headerSize + totalDataSize);
  const view = new DataView(buffer.buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, count, true);

  let offset = headerSize;
  entries.forEach((entry, index) => {
    const dir = 6 + 16 * index;
    buffer[dir] = entry.size >= 256 ? 0 : entry.size;
    buffer[dir + 1] = entry.size >= 256 ? 0 : entry.size;
    buffer[dir + 2] = 0;
    buffer[dir + 3] = 0;
    view.setUint16(dir + 4, 1, true);
    view.setUint16(dir + 6, 32, true);
    view.setUint32(dir + 8, entry.data.length, true);
    view.setUint32(dir + 12, offset, true);
    buffer.set(entry.data, offset);
    offset += entry.data.length;
  });

  return buffer;
}

function asBlob(data: Uint8Array, type: string) {
  return new Blob([data.slice()], { type });
}

export async function generateFaviconPackage(file: File): Promise<FaviconPackage> {
  if (!isAcceptedFaviconImage(file)) {
    throw new Error("Please upload an image file (PNG, JPG, or WebP).");
  }

  const image = await loadImageFromFile(file);
  URL.revokeObjectURL(image.src);

  const pngBySize = new Map<FaviconSize, Uint8Array>();
  for (const size of FAVICON_SIZES) {
    pngBySize.set(size, await renderPngAtSize(image, size));
  }

  const previewBlob = asBlob(pngBySize.get(32)!, "image/png");
  const previewUrl = URL.createObjectURL(previewBlob);

  const icoBytes = buildIco([
    { size: 16, data: pngBySize.get(16)! },
    { size: 32, data: pngBySize.get(32)! },
  ]);

  const files: FaviconFile[] = [
    { filename: "favicon.ico", blob: asBlob(icoBytes, "image/x-icon"), size: "ico" },
    { filename: "favicon-16x16.png", blob: asBlob(pngBySize.get(16)!, "image/png"), size: 16 },
    { filename: "favicon-32x32.png", blob: asBlob(pngBySize.get(32)!, "image/png"), size: 32 },
    { filename: "apple-touch-icon.png", blob: asBlob(pngBySize.get(180)!, "image/png"), size: 180 },
    { filename: "android-chrome-192x192.png", blob: asBlob(pngBySize.get(192)!, "image/png"), size: 192 },
    { filename: "android-chrome-512x512.png", blob: asBlob(pngBySize.get(512)!, "image/png"), size: 512 },
  ];

  return {
    files,
    htmlTags: FAVICON_HTML_TAGS,
    previewUrl,
  };
}

export function revokeFaviconPreview(url: string | null) {
  if (url) URL.revokeObjectURL(url);
}

export const FAVICON_FAQS = [
  {
    question: "What image size to start with?",
    answer: "Use a square image, ideally 512×512 pixels. PNG with a transparent background works best for logos.",
  },
  {
    question: "Why multiple sizes?",
    answer:
      "Browsers, iOS bookmarks, and Android/PWA installs each expect different icon sizes. This tool generates the common set in one step.",
  },
  {
    question: "Where to add favicon tags?",
    answer: "Paste the HTML link tags into the <head> section of your site. Place favicon.ico and PNG files in your site root or public folder.",
  },
  {
    question: "Will a detailed logo work?",
    answer: "Simple, bold shapes read best at 16×16 and 32×32. Very fine detail may blur when scaled down.",
  },
  {
    question: "Is favicon generator free?",
    answer: "Yes. Upload, generate, and download without an account. Everything runs in your browser.",
  },
];
