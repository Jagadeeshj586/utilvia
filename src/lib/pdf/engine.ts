import type { PDFDocumentProxy } from "pdfjs-dist";

type PdfJs = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfJs> | null = null;

async function getPdfJs(): Promise<PdfJs> {
  if (typeof window === "undefined") {
    throw new Error("PDF rendering is only available in the browser");
  }
  if (!pdfjsPromise) {
    pdfjsPromise = (
      Function('return import("/pdf.min.mjs")')() as Promise<PdfJs & { default?: PdfJs }>
    ).then((mod) => {
      const pdfjs = mod.default ?? mod;
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export async function loadPdf(file: File): Promise<PDFDocumentProxy> {
  const pdfjs = await getPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  return pdfjs.getDocument({ data, wasmUrl: "/wasm/" }).promise;
}

function isPasswordError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: string; message?: string; code?: number };
  if (candidate.name === "PasswordException") return true;
  return /password/i.test(candidate.message ?? "");
}

export async function loadPdfWithPassword(file: File, password: string): Promise<PDFDocumentProxy> {
  const pdfjs = await getPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  try {
    return await pdfjs.getDocument({ data, password, wasmUrl: "/wasm/" }).promise;
  } catch (error) {
    if (isPasswordError(error)) throw new Error("Incorrect password");
    throw error;
  }
}

export async function renderPageToCanvas(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  scale = 1.5,
) {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");
  await page.render({ canvasContext: context, viewport, canvas }).promise;
  return canvas;
}

export function parsePageRanges(input: string, pageCount: number) {
  const pages = new Set<number>();
  const parts = input.split(",").map((part) => part.trim()).filter(Boolean);
  for (const part of parts) {
    if (part.includes("-")) {
      const [startRaw, endRaw] = part.split("-");
      const start = Number(startRaw);
      const end = Number(endRaw);
      if (!start || !end || start > end) continue;
      for (let page = start; page <= Math.min(end, pageCount); page += 1) {
        if (page >= 1) pages.add(page);
      }
    } else {
      const page = Number(part);
      if (page >= 1 && page <= pageCount) pages.add(page);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}
