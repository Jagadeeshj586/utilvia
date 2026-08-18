import { PDFDocument } from "pdf-lib";
import { loadPdfWithPassword, renderPageToCanvas } from "@/lib/pdf/engine";
import { stemName } from "@/lib/pdf/common";
import { downloadBlob, uint8ToBlob } from "@/lib/utils";

function stillEncrypted(bytes: Uint8Array) {
  const decoder = new TextDecoder("latin1");
  if (bytes.byteLength <= 250_000) return /\/Encrypt[\s\/]/.test(decoder.decode(bytes));
  const head = decoder.decode(bytes.slice(0, 120_000));
  const tail = decoder.decode(bytes.slice(-120_000));
  return /\/Encrypt[\s\/]/.test(head) || /\/Encrypt[\s\/]/.test(tail);
}

async function rasterizeUnlocked(pdf: Awaited<ReturnType<typeof loadPdfWithPassword>>) {
  const out = await PDFDocument.create();
  for (let page = 1; page <= pdf.numPages; page += 1) {
    const canvas = await renderPageToCanvas(pdf, page, 2);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((next) => (next ? resolve(next) : reject(new Error("Unlock failed"))), "image/jpeg", 0.92);
    });
    const image = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
    const nextPage = out.addPage([image.width, image.height]);
    nextPage.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  return out.save();
}

export async function unlockPdf(file: File, password: string) {
  const pdf = await loadPdfWithPassword(file, password.trim());
  let bytes: Uint8Array | null = null;
  try {
    const saved = await pdf.saveDocument();
    if (saved?.byteLength && !stillEncrypted(saved)) bytes = saved;
  } catch {
    bytes = null;
  }
  if (!bytes) bytes = await rasterizeUnlocked(pdf);
  downloadBlob(uint8ToBlob(bytes, "application/pdf"), `${stemName(file.name)}_unlocked.pdf`);
}
