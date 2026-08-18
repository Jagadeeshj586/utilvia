"use client";

import { useState, type ComponentType } from "react";
import JSZip from "jszip";
import { Loader2 } from "lucide-react";
import { PDFDocument, PageSizes, StandardFonts, rgb, type PDFFont, type PDFImage } from "pdf-lib";
import { toast } from "sonner";
import { Dropzone } from "@/components/tools/dropzone";
import { ImageToPdf } from "@/components/tools/pdf/pdf-image-to-pdf";
import { PdfPageNumbers } from "@/components/tools/pdf/pdf-page-numbers";
import { PdfRotate } from "@/components/tools/pdf/pdf-rotate";
import { PdfUnlock } from "@/components/tools/pdf/pdf-unlock";
import { PdfWatermark } from "@/components/tools/pdf/pdf-watermark";
import { ToolNotice } from "@/components/tools/tool-notice";
import { Button } from "@/components/ui/button";
import { loadPdf } from "@/lib/pdf/engine";
import { stemName } from "@/lib/pdf/common";
import { downloadBlob, formatBytes, uint8ToBlob } from "@/lib/utils";

const A4 = PageSizes.A4;
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function winAnsi(text: string) {
  return text.replace(/[^\u0009\u000A\u000D\u0020-\u007E\u00A0-\u00FF]/g, "?");
}

function decodeXml(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function escapeXml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function stripXmlToText(xml: string) {
  return decodeXml(
    xml
      .replace(/<w:p[\s>]/gi, "\n")
      .replace(/<w:br\b[^/]*\/>/gi, "\n")
      .replace(/<w:tab\b[^/]*\/>/gi, "\t")
      .replace(/<a:p[\s>]/gi, "\n")
      .replace(/<a:br\b[^/]*\/>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim(),
  );
}

function extractTaggedText(xml: string, tag: string) {
  const matches = Array.from(xml.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi")));
  if (!matches.length) return "";
  return matches.map((match) => decodeXml(match[1].replace(/<[^>]+>/g, ""))).join("\n").trim();
}

function wrapText(font: PDFFont, text: string, size: number, maxWidth: number) {
  const words = winAnsi(text).replace(/\t/g, "  ").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  const splitLong = (word: string) => {
    let rest = word;
    while (rest && font.widthOfTextAtSize(rest, size) > maxWidth) {
      let cut = rest.length;
      while (cut > 1 && font.widthOfTextAtSize(rest.slice(0, cut), size) > maxWidth) cut -= 1;
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }
    current = rest;
  };

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      if (font.widthOfTextAtSize(word, size) > maxWidth) splitLong(word);
      else current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function drawWrappedTextPdf(text: string) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const [pageW, pageH] = A4;
  const margin = 48;
  const fontSize = 11;
  const lineHeight = 15;
  const paragraphs = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  let page = pdf.addPage([pageW, pageH]);
  let y = pageH - margin;

  if (!paragraphs.length) {
    page.drawText("(No extractable text)", {
      x: margin,
      y,
      size: fontSize,
      font,
      color: rgb(0.4, 0.4, 0.45),
    });
  }

  for (const paragraph of paragraphs) {
    const lines = wrapText(font, paragraph, fontSize, pageW - margin * 2);
    for (const line of lines) {
      if (y < margin + lineHeight) {
        page = pdf.addPage([pageW, pageH]);
        y = pageH - margin;
      }
      page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0.12, 0.12, 0.14) });
      y -= lineHeight;
    }
    y -= 8;
  }

  return uint8ToBlob(await pdf.save(), "application/pdf");
}

async function embedBytes(pdf: PDFDocument, bytes: Uint8Array, hint: string) {
  const lower = hint.toLowerCase();
  if (lower.endsWith(".png") || lower.includes("png")) {
    try {
      return await pdf.embedPng(bytes);
    } catch {
      /* fall through */
    }
  }
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.includes("jpeg") || lower.includes("jpg")) {
    try {
      return await pdf.embedJpg(bytes);
    } catch {
      /* fall through */
    }
  }
  try {
    return await pdf.embedPng(bytes);
  } catch {
    return await pdf.embedJpg(bytes);
  }
}

function colIndex(ref: string) {
  const letters = ref.match(/^[A-Z]+/i)?.[0] ?? "A";
  let col = 0;
  for (const ch of letters.toUpperCase()) col = col * 26 + (ch.charCodeAt(0) - 64);
  return col - 1;
}

function rowIndex(ref: string) {
  return Math.max(0, Number(ref.match(/\d+$/)?.[0] ?? "1") - 1);
}

function parseSharedStrings(xml: string) {
  return Array.from(xml.matchAll(/<(?:\w+:)?si\b[^>]*>([\s\S]*?)<\/(?:\w+:)?si>/gi)).map((match) =>
    decodeXml(Array.from(match[1].matchAll(/<(?:\w+:)?t\b[^>]*>([\s\S]*?)<\/(?:\w+:)?t>/gi)).map((part) => part[1]).join("")),
  );
}

function parseSheetGrid(xml: string, shared: string[]) {
  const cells = Array.from(xml.matchAll(/<(?:\w+:)?c\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?c>/gi));
  const values = new Map<string, string>();
  let maxRow = 0;
  let maxCol = 0;

  for (const match of cells) {
    const attrs = match[1];
    const inner = match[2];
    const ref = attrs.match(/\br="([A-Z]+\d+)"/i)?.[1];
    if (!ref) continue;
    const type = attrs.match(/\bt="([^"]+)"/i)?.[1] ?? "";
    let value = "";
    if (type === "s") {
      const index = Number(inner.match(/<(?:\w+:)?v\b[^>]*>([\s\S]*?)<\/(?:\w+:)?v>/i)?.[1] ?? "");
      value = Number.isFinite(index) ? (shared[index] ?? "") : "";
    } else if (type === "inlineStr") {
      value = decodeXml((inner.match(/<(?:\w+:)?t\b[^>]*>([\s\S]*?)<\/(?:\w+:)?t>/i)?.[1] ?? "").replace(/<[^>]+>/g, ""));
    } else if (type === "str") {
      value = decodeXml(inner.match(/<(?:\w+:)?v\b[^>]*>([\s\S]*?)<\/(?:\w+:)?v>/i)?.[1] ?? "");
    } else {
      value = (inner.match(/<(?:\w+:)?v\b[^>]*>([\s\S]*?)<\/(?:\w+:)?v>/i)?.[1] ?? "").trim();
    }
    const row = rowIndex(ref);
    const col = colIndex(ref);
    maxRow = Math.max(maxRow, row);
    maxCol = Math.max(maxCol, col);
    values.set(`${row}:${col}`, value);
  }

  const grid: string[][] = [];
  for (let row = 0; row <= maxRow; row += 1) {
    const next: string[] = [];
    for (let col = 0; col <= maxCol; col += 1) next.push(values.get(`${row}:${col}`) ?? "");
    grid.push(next);
  }
  return grid;
}

function buildMinimalDocx(paragraphs: string[]) {
  const body = (paragraphs.length ? paragraphs : ["(No extractable text)"])
    .map((paragraph) => `<w:p><w:r><w:t xml:space="preserve">${escapeXml(paragraph)}</w:t></w:r></w:p>`)
    .join("");

  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  );
  zip.file(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`,
  );
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/></w:sectPr></w:body>
</w:document>`,
  );
  return zip;
}

async function extractDocxText(file: File) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const documentXml = zip.file("word/document.xml");
  if (!documentXml) throw new Error("This file does not look like a .docx document");
  const xml = await documentXml.async("string");
  const tagged = extractTaggedText(xml, "w:t");
  return tagged || stripXmlToText(xml);
}

export function PdfToWord() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const file = files[0] ?? null;

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const pdf = await loadPdf(file);
      const paragraphs: string[] = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        let pageText = "";
        for (const item of content.items) {
          if (!("str" in item) || typeof item.str !== "string") continue;
          pageText += item.str;
          pageText += "hasEOL" in item && item.hasEOL ? "\n" : " ";
        }
        const cleaned = pageText.replace(/[ \t]+\n/g, "\n").replace(/ {2,}/g, " ").trim();
        paragraphs.push(`Page ${pageNumber}`);
        if (cleaned) paragraphs.push(...cleaned.split(/\n+/).map((line) => line.trim()).filter(Boolean));
        else paragraphs.push("(No extractable text on this page)");
      }
      const zip = buildMinimalDocx(paragraphs);
      downloadBlob(await zip.generateAsync({ type: "blob" }), `${stemName(file.name)}.docx`);
      toast.success("✅ Conversion complete! Downloading...");
    } catch (caught) {
      const message = errorMessage(caught, "Conversion failed. Please try again.");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <ToolNotice>Runs locally. Extracts the PDF text layer into a .docx - layout, images, and scanned pages are not OCR’d. Large files may take longer.</ToolNotice>
      <Dropzone
        accept="application/pdf,.pdf"
        maxSizeMB={50}
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setError(null);
        }}
        onRemove={() => {
          setFiles([]);
          setError(null);
        }}
        label="Drop your PDF here"
        hint="or click to browse - max 50MB"
      />
      {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
      <Button onClick={convert} disabled={!file || busy} className="w-full">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Converting...
          </>
        ) : (
          "Convert to Word"
        )}
      </Button>
    </div>
  );
}

export function WordToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const file = files[0] ?? null;

  const convert = async () => {
    if (!file) return;
    if (/\.doc$/i.test(file.name) && !/\.docx$/i.test(file.name)) {
      setError("Please save as .docx and try again.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const text = await extractDocxText(file);
      const blob = await drawWrappedTextPdf(text);
      setResult(blob);
      toast.success("PDF ready");
    } catch (caught) {
      const message = errorMessage(caught, "Conversion failed. Please try a different Word file.");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <ToolNotice>Runs locally. Builds a readable PDF from the document text - complex Word layout is flattened.</ToolNotice>
      <Dropzone
        accept={`.doc,.docx,application/msword,${DOCX_MIME}`}
        maxSizeMB={20}
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setResult(null);
          setError(null);
        }}
        onRemove={() => {
          setFiles([]);
          setResult(null);
          setError(null);
        }}
        label="Drop your Word file here"
        hint="or click to browse - .doc, .docx - max 20MB"
      />
      {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
      {file && !result ? (
        <Button onClick={convert} disabled={busy} className="w-full">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : (
            "Convert to PDF"
          )}
        </Button>
      ) : null}
      {file && result ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5">
              <p className="text-sm text-[var(--muted-ink)]">Original Size</p>
              <p className="mt-1 text-xl font-semibold text-ink">{formatBytes(file.size)}</p>
            </div>
            <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5">
              <p className="text-sm text-[var(--muted-ink)]">Output PDF Size</p>
              <p className="mt-1 text-xl font-semibold text-ink">{formatBytes(result.size)}</p>
            </div>
          </div>
          <Button onClick={() => downloadBlob(result, `${stemName(file.name)}.pdf`)} className="w-full">
            Download PDF
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-[var(--muted-ink)] transition-colors hover:text-ink"
            onClick={() => {
              setFiles([]);
              setResult(null);
              setError(null);
            }}
          >
            Convert Another
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ExcelToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; sheets: number } | null>(null);
  const file = files[0] ?? null;

  const convert = async () => {
    if (!file) return;
    if (/\.xls$/i.test(file.name) && !/\.xlsx$/i.test(file.name)) {
      setError("Please save as .xlsx and try again.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const sharedXml = zip.file("xl/sharedStrings.xml");
      const shared = sharedXml ? parseSharedStrings(await sharedXml.async("string")) : [];
      const sheetFiles = Object.keys(zip.files)
        .filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name))
        .sort((a, b) => Number(a.match(/sheet(\d+)/i)?.[1] ?? 0) - Number(b.match(/sheet(\d+)/i)?.[1] ?? 0));
      if (!sheetFiles.length) throw new Error("Could not find any worksheets");

      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      let sheetCount = 0;

      for (const sheetName of sheetFiles) {
        const sheetXml = zip.file(sheetName);
        if (!sheetXml) continue;
        const grid = parseSheetGrid(await sheetXml.async("string"), shared);
        if (!grid.length) continue;
        sheetCount += 1;
        const cols = Math.max(1, ...grid.map((row) => row.length));
        const landscape = cols > 6;
        const pageW = landscape ? A4[1] : A4[0];
        const pageH = landscape ? A4[0] : A4[1];
        const margin = 28;
        const fontSize = cols > 10 ? 7 : cols > 6 ? 8 : 9;
        const rowH = fontSize + 8;
        const usableW = pageW - margin * 2;
        const colW = usableW / cols;
        let page = pdf.addPage([pageW, pageH]);
        let y = pageH - margin;
        page.drawText(winAnsi(`Sheet ${sheetCount}`), {
          x: margin,
          y: y - 4,
          size: 11,
          font,
          color: rgb(0.2, 0.2, 0.22),
        });
        y -= 22;

        const drawRow = (cells: string[], header = false) => {
          if (y < margin + rowH) {
            page = pdf.addPage([pageW, pageH]);
            y = pageH - margin;
          }
          for (let col = 0; col < cols; col += 1) {
            const x = margin + col * colW;
            page.drawRectangle({
              x,
              y: y - rowH + 4,
              width: colW,
              height: rowH,
              borderColor: rgb(0.82, 0.82, 0.86),
              borderWidth: 0.5,
              color: header ? rgb(0.95, 0.95, 0.97) : rgb(1, 1, 1),
            });
            const cell = winAnsi((cells[col] ?? "").replace(/\s+/g, " ")).trim();
            if (!cell) continue;
            let label = cell;
            while (label.length > 1 && font.widthOfTextAtSize(label, fontSize) > colW - 8) label = label.slice(0, -1);
            page.drawText(label, {
              x: x + 4,
              y: y - fontSize - 2,
              size: fontSize,
              font,
              color: rgb(0.12, 0.12, 0.14),
            });
          }
          y -= rowH;
        };

        grid.forEach((row, index) => drawRow(row, index === 0));
      }

      if (!sheetCount) throw new Error("The spreadsheet looks empty");
      const blob = uint8ToBlob(await pdf.save(), "application/pdf");
      setResult({ blob, sheets: sheetCount });
      toast.success(`${sheetCount} sheet${sheetCount === 1 ? "" : "s"} converted`);
    } catch (caught) {
      const message = errorMessage(caught, "Conversion failed. Please try a different Excel file.");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <ToolNotice>Runs locally. All sheets become PDF pages as text tables - charts and formatting are not preserved.</ToolNotice>
      <Dropzone
        accept={`.xlsx,.xls,${XLSX_MIME},application/vnd.ms-excel`}
        maxSizeMB={20}
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setResult(null);
          setError(null);
        }}
        onRemove={() => {
          setFiles([]);
          setResult(null);
          setError(null);
        }}
        label="Drop your Excel file here"
        hint=".xlsx or .xls - max 20MB"
      />
      {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
      {file && !result ? (
        <Button onClick={convert} disabled={busy} className="w-full">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : (
            "Convert to PDF"
          )}
        </Button>
      ) : null}
      {file && result ? (
        <div className="space-y-4">
          <p className="text-center text-sm text-[var(--muted-ink)]">
            {result.sheets} sheet{result.sheets === 1 ? "" : "s"} converted · {formatBytes(result.blob.size)}
          </p>
          <Button onClick={() => downloadBlob(result.blob, `${stemName(file.name)}.pdf`)} className="w-full">
            Download PDF
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-[var(--muted-ink)] transition-colors hover:text-ink"
            onClick={() => {
              setFiles([]);
              setResult(null);
              setError(null);
            }}
          >
            Convert Another
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function PptToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; slides: number } | null>(null);
  const file = files[0] ?? null;

  const convert = async () => {
    if (!file) return;
    if (/\.ppt$/i.test(file.name) && !/\.pptx$/i.test(file.name)) {
      setError("Legacy .ppt format is not supported in the browser. Please save as .pptx and try again.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const slideNames = Object.keys(zip.files)
        .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
        .sort((a, b) => Number(a.match(/slide(\d+)/i)?.[1] ?? 0) - Number(b.match(/slide(\d+)/i)?.[1] ?? 0));
      if (!slideNames.length) throw new Error("No slides found in this presentation");

      const mediaEntries = await Promise.all(
        Object.keys(zip.files)
          .filter((name) => name.startsWith("ppt/media/") && !name.endsWith("/"))
          .map(async (name) => ({ name, bytes: new Uint8Array(await zip.files[name].async("uint8array")) })),
      );

      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pageW = 960;
      const pageH = 540;
      const margin = 36;

      const embedded: PDFImage[] = [];
      for (const media of mediaEntries) {
        try {
          embedded.push(await embedBytes(pdf, media.bytes, media.name));
        } catch {
          /* skip emf/wmf/tiff and other unsupported media */
        }
      }

      for (let i = 0; i < slideNames.length; i += 1) {
        const xml = await zip.files[slideNames[i]].async("string");
        const text = extractTaggedText(xml, "a:t") || stripXmlToText(xml);
        const page = pdf.addPage([pageW, pageH]);
        page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: rgb(1, 1, 1) });

        const lines = text
          ? text.split(/\n+/).flatMap((paragraph) => wrapText(font, paragraph, 16, pageW - margin * 2))
          : [`Slide ${i + 1}`];
        let y = pageH - margin;
        for (const line of lines.slice(0, 12)) {
          page.drawText(line, { x: margin, y, size: 16, font, color: rgb(0.12, 0.12, 0.16) });
          y -= 22;
        }

        const image = embedded[i];
        if (image && y > margin + 80) {
          const maxW = pageW - margin * 2;
          const maxH = y - margin;
          const scale = Math.min(maxW / image.width, maxH / image.height, 1);
          const width = image.width * scale;
          const height = image.height * scale;
          page.drawImage(image, { x: (pageW - width) / 2, y: margin, width, height });
        }
      }

      const blob = uint8ToBlob(await pdf.save(), "application/pdf");
      setResult({ blob, slides: slideNames.length });
      toast.success(`${slideNames.length} slide${slideNames.length === 1 ? "" : "s"} converted`);
    } catch (caught) {
      const message = errorMessage(caught, "Conversion failed. Please try a different PowerPoint file.");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <ToolNotice>Runs locally. Each slide becomes a PDF page from text plus embedded PNG/JPG media - animations and complex layout are skipped.</ToolNotice>
      <Dropzone
        accept={`.ppt,.pptx,application/vnd.ms-powerpoint,${PPTX_MIME}`}
        maxSizeMB={50}
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setResult(null);
          setError(null);
        }}
        onRemove={() => {
          setFiles([]);
          setResult(null);
          setError(null);
        }}
        label="Drop your PowerPoint file here"
        hint=".pptx recommended - max 50MB"
      />
      {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
      {file && !result ? (
        <Button onClick={convert} disabled={busy} className="w-full">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : (
            "Convert to PDF"
          )}
        </Button>
      ) : null}
      {file && result ? (
        <div className="space-y-4">
          <p className="text-center text-sm text-[var(--muted-ink)]">
            {result.slides} slide{result.slides === 1 ? "" : "s"} converted · {formatBytes(result.blob.size)}
          </p>
          <Button onClick={() => downloadBlob(result.blob, `${stemName(file.name)}.pdf`)} className="w-full">
            Download PDF
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-[var(--muted-ink)] transition-colors hover:text-ink"
            onClick={() => {
              setFiles([]);
              setResult(null);
              setError(null);
            }}
          >
            Convert Another
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function WordToJpg() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const file = files[0] ?? null;

  const convert = async () => {
    if (!file) return;
    if (!/\.docx$/i.test(file.name)) {
      setError("Please upload a .docx Word document.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const text = await extractDocxText(file);
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1600;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1f2937";
      ctx.font = "20px Helvetica, Arial, sans-serif";
      const maxWidth = canvas.width - 96;
      const paragraphs = (text || "(No extractable text)").split(/\n+/);
      let y = 72;
      for (const paragraph of paragraphs) {
        const words = paragraph.split(/\s+/).filter(Boolean);
        let line = "";
        for (const word of words) {
          const next = line ? `${line} ${word}` : word;
          if (ctx.measureText(next).width <= maxWidth) {
            line = next;
          } else {
            ctx.fillText(line, 48, y);
            y += 30;
            line = word;
            if (y > canvas.height - 48) break;
          }
        }
        if (line && y <= canvas.height - 48) {
          ctx.fillText(line, 48, y);
          y += 38;
        }
        if (y > canvas.height - 48) break;
      }
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((next) => (next ? resolve(next) : reject(new Error("Could not encode JPEG"))), "image/jpeg", 0.92);
      });
      downloadBlob(blob, `${stemName(file.name)}.jpg`);
      setPreview(URL.createObjectURL(blob));
      toast.success("JPEG downloaded");
    } catch (caught) {
      const message = errorMessage(caught, "Conversion failed. Try a simpler document layout or save as PDF first.");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <ToolNotice>Runs locally. Renders extracted Word text onto a JPEG page - not a pixel-perfect print preview.</ToolNotice>
      <Dropzone
        accept={`.docx,${DOCX_MIME}`}
        maxSizeMB={20}
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setPreview(null);
          setError(null);
        }}
        onRemove={() => {
          setFiles([]);
          setPreview(null);
          setError(null);
        }}
        label="Upload .docx file"
        hint="Word documents only - max 20MB"
      />
      {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
      <Button onClick={convert} disabled={!file || busy} className="w-full">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Converting...
          </>
        ) : (
          "Download JPG"
        )}
      </Button>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Converted JPG preview" className="w-full rounded-lg border border-[var(--hairline)]" />
      ) : null}
    </div>
  );
}

const PDF_EXTRA_MAP: Record<string, ComponentType> = {
  "remove-pdf-password": PdfUnlock,
  "rotate-pdf": PdfRotate,
  "pdf-page-numbers": PdfPageNumbers,
  "pdf-watermark": PdfWatermark,
  "image-to-pdf": ImageToPdf,
  "jpg-to-pdf": ImageToPdf,
  "pdf-to-word": PdfToWord,
  "word-to-pdf": WordToPdf,
  "excel-to-pdf": ExcelToPdf,
  "ppt-to-pdf": PptToPdf,
  "word-to-jpg": WordToJpg,
};

export function PdfExtrasRouter({ slug }: { slug: string }) {
  const Component = PDF_EXTRA_MAP[slug];
  if (!Component) {
    return <p className="text-sm text-[var(--muted-ink)]">This PDF tool is not available yet.</p>;
  }
  return <Component />;
}
