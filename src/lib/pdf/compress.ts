import { PDFDocument } from "pdf-lib";
import { loadPdf, renderPageToCanvas } from "@/lib/pdf/engine";

export type CompressLevel = "low" | "medium" | "high";

export const COMPRESS_LEVELS = [
  {
    id: "low" as const,
    label: "Low",
    hint: "Smallest file · WhatsApp & email",
    scale: 1.05,
    quality: 0.52,
    mode: "raster" as const,
  },
  {
    id: "medium" as const,
    label: "Medium",
    hint: "Balanced · portals & forms",
    scale: 1.35,
    quality: 0.72,
    mode: "raster" as const,
  },
  {
    id: "high" as const,
    label: "High",
    hint: "Best quality · print & archive",
    scale: 1.65,
    quality: 0.88,
    mode: "structural" as const,
  },
];

export function getCompressPreset(level: CompressLevel) {
  return COMPRESS_LEVELS.find((item) => item.id === level) ?? COMPRESS_LEVELS[1];
}

function yieldToUi() {
  return new Promise<void>((resolve) => window.setTimeout(resolve, 0));
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Uint8Array>((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Could not encode page image"));
          return;
        }
        resolve(new Uint8Array(await blob.arrayBuffer()));
      },
      "image/jpeg",
      quality,
    );
  });
}

async function structuralCompress(file: File) {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true, updateMetadata: false });
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, src.getPageIndices());
  pages.forEach((page) => out.addPage(page));
  out.setProducer("Utilvia");
  out.setCreator("Utilvia");
  return out.save({ useObjectStreams: true });
}

async function rasterCompress(
  file: File,
  scale: number,
  quality: number,
  onProgress?: (current: number, total: number) => void,
) {
  const source = await loadPdf(file);
  const out = await PDFDocument.create();
  const total = source.numPages;

  for (let pageNumber = 1; pageNumber <= total; pageNumber += 1) {
    onProgress?.(pageNumber, total);
    const pdfPage = await source.getPage(pageNumber);
    const size = pdfPage.getViewport({ scale: 1 });
    const canvas = await renderPageToCanvas(source, pageNumber, scale);
    const jpeg = await canvasToJpeg(canvas, quality);
    const image = await out.embedJpg(jpeg);
    const page = out.addPage([size.width, size.height]);
    page.drawImage(image, { x: 0, y: 0, width: size.width, height: size.height });
    canvas.width = 0;
    canvas.height = 0;
    await yieldToUi();
  }

  out.setProducer("Utilvia");
  out.setCreator("Utilvia");
  return out.save({ useObjectStreams: true });
}

export async function compressPdfFile(
  file: File,
  level: CompressLevel,
  onProgress?: (current: number, total: number) => void,
) {
  try {
    await loadPdf(file);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/password/i.test(message)) {
      throw new Error("This PDF is password-protected. Remove the password first, then compress.");
    }
    throw error;
  }

  const preset = getCompressPreset(level);
  onProgress?.(0, 1);

  if (preset.mode === "structural") {
    const structural = await structuralCompress(file);
    const saved = file.size - structural.byteLength;
    if (saved >= file.size * 0.08) {
      onProgress?.(1, 1);
      return structural;
    }
  }

  const raster = await rasterCompress(file, preset.scale, preset.quality, onProgress);
  if (raster.byteLength >= file.size) {
    const structural = await structuralCompress(file);
    if (structural.byteLength < raster.byteLength) return structural;
  }
  return raster;
}
