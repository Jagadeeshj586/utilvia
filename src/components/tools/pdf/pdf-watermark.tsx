"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { toast } from "sonner";
import { Dropzone } from "@/components/tools/dropzone";
import { PdfFileDrop } from "@/components/tools/pdf/pdf-file-drop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { pdfReadError, stemName } from "@/lib/pdf/common";
import { downloadBlob, uint8ToBlob } from "@/lib/utils";

type Mode = "text" | "image";

function winAnsi(text: string) {
  return text.replace(/[^\u0009\u000A\u000D\u0020-\u007E\u00A0-\u00FF]/g, "?");
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((ch) => ch + ch).join("") : clean.padEnd(6, "0");
  const value = Number.parseInt(full.slice(0, 6), 16);
  if (!Number.isFinite(value)) return rgb(0.45, 0.45, 0.48);
  return rgb(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255);
}

async function embedRaster(pdf: PDFDocument, file: File) {
  const bytes = await file.arrayBuffer();
  if (file.type === "image/png" || file.name.toLowerCase().endsWith(".png")) {
    return pdf.embedPng(bytes);
  }
  return pdf.embedJpg(bytes);
}

function drawTextWatermark(
  page: PDFPage,
  font: PDFFont,
  text: string,
  options: { size: number; color: string; opacity: number; rotation: number; tile: boolean },
) {
  const safe = winAnsi(text || "DRAFT");
  const { width, height } = page.getSize();
  const color = hexToRgb(options.color);
  const textWidth = font.widthOfTextAtSize(safe, options.size);
  const stamps = options.tile
    ? (() => {
        const items: { x: number; y: number }[] = [];
        const stepX = Math.max(textWidth * 1.4, 120);
        const stepY = Math.max(options.size * 3.2, 80);
        for (let y = -height; y < height * 2; y += stepY) {
          for (let x = -width; x < width * 2; x += stepX) items.push({ x, y });
        }
        return items;
      })()
    : [{ x: (width - textWidth) / 2, y: height / 2 - options.size / 2 }];

  stamps.forEach(({ x, y }) => {
    page.drawText(safe, {
      x,
      y,
      size: options.size,
      font,
      color,
      opacity: options.opacity,
      rotate: degrees(options.rotation),
    });
  });
}

function drawImageWatermark(
  page: PDFPage,
  image: PDFImage,
  options: { scale: number; opacity: number; rotation: number; tile: boolean },
) {
  const { width, height } = page.getSize();
  const drawW = image.width * options.scale;
  const drawH = image.height * options.scale;
  const stamps = options.tile
    ? (() => {
        const items: { x: number; y: number }[] = [];
        const stepX = Math.max(drawW * 1.3, 80);
        const stepY = Math.max(drawH * 1.3, 80);
        for (let y = -height; y < height * 2; y += stepY) {
          for (let x = -width; x < width * 2; x += stepX) items.push({ x, y });
        }
        return items;
      })()
    : [{ x: (width - drawW) / 2, y: (height - drawH) / 2 }];

  stamps.forEach(({ x, y }) => {
    page.drawImage(image, {
      x,
      y,
      width: drawW,
      height: drawH,
      opacity: options.opacity,
      rotate: degrees(options.rotation),
    });
  });
}

export function PdfWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("DRAFT");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#737373");
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(-45);
  const [scale, setScale] = useState(0.35);
  const [tile, setTile] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  const onFile = async (next: File | null) => {
    setResult(null);
    setError(null);
    setFile(next);
    setPageCount(0);
    if (!next) return;
    try {
      const pdf = await PDFDocument.load(await next.arrayBuffer());
      setPageCount(pdf.getPageCount());
    } catch (caught) {
      const message = pdfReadError(caught, "Unable to read PDF.");
      setError(message);
      setFile(null);
      toast.error(message);
    }
  };

  const apply = async () => {
    if (!file) return;
    if (mode === "text" && !text.trim()) {
      setError("Enter watermark text.");
      return;
    }
    if (mode === "image" && !imageFile) {
      setError("Upload a logo or image for the watermark.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const image = mode === "image" && imageFile ? await embedRaster(pdf, imageFile) : null;
      pdf.getPages().forEach((page) => {
        if (mode === "image" && image) {
          drawImageWatermark(page, image, { scale, opacity, rotation, tile });
        } else {
          drawTextWatermark(page, font, text.trim(), { size: fontSize, color, opacity, rotation, tile });
        }
      });
      const blob = uint8ToBlob(await pdf.save(), "application/pdf");
      setResult(blob);
      toast.success("Watermark applied");
    } catch (caught) {
      const message = pdfReadError(caught, "Watermark failed. Please try again.");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!file || !result) return;
    downloadBlob(result, `watermarked_${stemName(file.name)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <PdfFileDrop
        file={file}
        onFile={onFile}
        error={error}
        onError={setError}
        meta={pageCount ? `${pageCount} page${pageCount === 1 ? "" : "s"}` : null}
      />

      {file ? (
        <>
          <div className="flex flex-wrap gap-2">
            {(["text", "image"] as const).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={mode === value ? "default" : "outline"}
                onClick={() => {
                  setMode(value);
                  setResult(null);
                  setError(null);
                }}
              >
                {value === "text" ? "Text" : "Image"} watermark
              </Button>
            ))}
          </div>

          {mode === "text" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="watermark-text">Text</Label>
                <Input
                  id="watermark-text"
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value);
                    setResult(null);
                  }}
                  placeholder="DRAFT, CONFIDENTIAL..."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label>Font size</Label>
                    <span className="tabular-nums text-[var(--muted-ink)]">{fontSize}</span>
                  </div>
                  <Slider min={18} max={96} step={2} value={[fontSize]} onValueChange={([value]) => { setFontSize(value); setResult(null); }} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="watermark-color">Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="watermark-color"
                      type="color"
                      value={color}
                      onChange={(event) => {
                        setColor(event.target.value);
                        setResult(null);
                      }}
                      className="h-10 w-12 cursor-pointer rounded-md border border-[var(--hairline)] bg-canvas"
                    />
                    <Input value={color} onChange={(event) => { setColor(event.target.value); setResult(null); }} className="font-mono uppercase" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Dropzone
                compact
                accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                maxSizeMB={10}
                files={imageFile ? [imageFile] : []}
                onFiles={(next) => {
                  const incoming = next[0];
                  if (!incoming) {
                    setImageFile(null);
                    return;
                  }
                  const name = incoming.name.toLowerCase();
                  const type = incoming.type.toLowerCase();
                  const ok = type.includes("png") || type.includes("jpeg") || type.includes("jpg") || name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg");
                  if (!ok) {
                    setError("Please select a PNG or JPG image.");
                    return;
                  }
                  setImageFile(incoming);
                  setResult(null);
                  setError(null);
                }}
                onRemove={() => {
                  setImageFile(null);
                  setResult(null);
                }}
                label="Upload logo or Image"
                hint="PNG or JPG - max 10MB"
              />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Image size (scale)</Label>
                  <span className="tabular-nums text-[var(--muted-ink)]">{Math.round(scale * 100)}%</span>
                </div>
                <Slider min={0.1} max={1} step={0.05} value={[scale]} onValueChange={([value]) => { setScale(value); setResult(null); }} />
              </div>
            </>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Opacity</Label>
                <span className="tabular-nums text-[var(--muted-ink)]">{Math.round(opacity * 100)}%</span>
              </div>
              <Slider min={0.08} max={0.8} step={0.02} value={[opacity]} onValueChange={([value]) => { setOpacity(value); setResult(null); }} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Rotation (degrees)</Label>
                <span className="tabular-nums text-[var(--muted-ink)]">{rotation}°</span>
              </div>
              <Slider min={-90} max={90} step={5} value={[rotation]} onValueChange={([value]) => { setRotation(value); setResult(null); }} />
            </div>
          </div>

          <label className="flex items-center justify-between gap-3 rounded-md border border-[var(--hairline)] px-3 py-2">
            <span className="text-sm">Tile watermark across page (diagonal pattern)</span>
            <Switch
              checked={tile}
              onCheckedChange={(checked) => {
                setTile(checked);
                setResult(null);
              }}
            />
          </label>

          {!result ? (
            <Button onClick={apply} disabled={busy} className="w-full">
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply Watermark"
              )}
            </Button>
          ) : (
            <Button onClick={download} className="w-full">
              Download Watermarked PDF
            </Button>
          )}
        </>
      ) : null}
    </div>
  );
}
