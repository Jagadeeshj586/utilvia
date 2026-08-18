import { PDFDocument } from "pdf-lib";
import { MAX_PDF_BYTES, isPdfFile } from "@/lib/pdf/common";

export { isPdfFile, MAX_PDF_BYTES };

export function validateMergeFiles(incoming: File[]) {
  const accepted: File[] = [];
  let error: string | null = null;

  for (const file of incoming) {
    if (!isPdfFile(file)) {
      error = "Only PDF files are supported.";
      continue;
    }
    if (file.size > MAX_PDF_BYTES) {
      error = "Each PDF must be 50MB or smaller.";
      continue;
    }
    accepted.push(file);
  }

  return { accepted, error };
}

export async function mergePdfFiles(files: File[]) {
  if (files.length < 2) {
    throw new Error("Add at least two PDFs");
  }

  const merged = await PDFDocument.create();
  let pageCount = 0;

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    let source: PDFDocument;
    try {
      source = await PDFDocument.load(bytes);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/password|encrypt/i.test(message)) {
        throw new Error(`${file.name} is password-protected. Remove the password first, then merge.`);
      }
      throw new Error("Merge failed. Please check your PDF files and try again.");
    }

    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
    pageCount += source.getPageCount();
  }

  const saved = await merged.save();
  return { bytes: saved, pageCount };
}
