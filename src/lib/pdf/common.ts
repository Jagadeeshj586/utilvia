export const MAX_PDF_BYTES = 50 * 1024 * 1024;

export function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function validatePdfFile(file: File) {
  if (!isPdfFile(file)) return "Please select a valid PDF file.";
  if (file.size > MAX_PDF_BYTES) return "PDF must be 50MB or smaller.";
  return null;
}

export function pdfReadError(error: unknown, fallback = "Unable to read PDF.") {
  const message = error instanceof Error ? error.message : "";
  if (/password|encrypt/i.test(message)) {
    return "Unable to read PDF. The file may be corrupted or password-protected.";
  }
  return message || fallback;
}

export function stemName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "") || "document";
}
