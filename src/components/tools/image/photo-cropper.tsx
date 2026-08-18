"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Dropzone } from "@/components/tools/dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, downloadBlob } from "@/lib/utils";

type Preset = {
  id: string;
  name: string;
  width: number;
  height: number;
  maxKb: number;
  description: string;
};

const PRESETS: Preset[] = [
  { id: "aadhaar", name: "Aadhaar Card", width: 413, height: 531, maxKb: 50, description: "35mm × 45mm" },
  { id: "pan", name: "PAN Card", width: 413, height: 295, maxKb: 300, description: "3.5cm × 2.5cm" },
  { id: "passport", name: "Passport (India)", width: 630, height: 810, maxKb: 250, description: "35mm × 45mm" },
  { id: "visa", name: "Visa Photo", width: 600, height: 600, maxKb: 500, description: "50mm × 50mm" },
  { id: "driving-licence", name: "Driving Licence", width: 413, height: 531, maxKb: 200, description: "35mm × 45mm" },
  { id: "government-exam", name: "Government Exam (UPSC/SSC)", width: 350, height: 350, maxKb: 50, description: "35mm × 35mm" },
  { id: "custom", name: "Custom Size", width: 0, height: 0, maxKb: 0, description: "Set your own" },
];

type Bg = "white" | "gray" | "transparent";
type CropBox = { x: number; y: number; w: number; h: number };

async function canvasToBlobUnderKb(canvas: HTMLCanvasElement, maxKb: number, transparent: boolean) {
  const type = transparent ? "image/png" : "image/jpeg";
  if (!maxKb || transparent) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.92));
    if (!blob) throw new Error("Could not encode image");
    return blob;
  }
  let quality = 0.92;
  let blob: Blob | null = null;
  while (quality >= 0.35) {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) throw new Error("Could not encode image");
    if (blob.size <= maxKb * 1024) return blob;
    quality -= 0.08;
  }
  return blob!;
}

export function PhotoCropper() {
  const [file, setFile] = useState<File | null>(null);
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [customW, setCustomW] = useState(600);
  const [customH, setCustomH] = useState(600);
  const [customKb, setCustomKb] = useState(200);
  const [bg, setBg] = useState<Bg>("white");
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<CropBox>({ x: 40, y: 40, w: 220, h: 280 });
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const preset = PRESETS.find((item) => item.id === presetId) ?? PRESETS[0];
  const targetW = preset.id === "custom" ? Math.max(1, customW) : preset.width;
  const targetH = preset.id === "custom" ? Math.max(1, customH) : preset.height;
  const maxKb = preset.id === "custom" ? Math.max(0, customKb) : preset.maxKb;

  useEffect(() => {
    if (!previewUrl) {
      setImage(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      setImage(img);
      const ratio = targetW / targetH;
      const maxW = Math.min(img.width, img.height * ratio);
      const w = maxW * 0.8;
      const h = w / ratio;
      setCrop({ x: (img.width - w) / 2, y: (img.height - h) / 2, w, h });
    };
    img.src = previewUrl;
  }, [previewUrl, targetW, targetH]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const maxW = 520;
    const scale = Math.min(1, maxW / image.width);
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(15,23,42,0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h, crop.x * scale, crop.y * scale, crop.w * scale, crop.h * scale);
    ctx.strokeStyle = "#cc785c";
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x * scale, crop.y * scale, crop.w * scale, crop.h * scale);
  }, [crop, image]);

  const exportCrop = async () => {
    if (!image) return;
    const out = document.createElement("canvas");
    out.width = targetW;
    out.height = targetH;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    if (bg === "white") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, out.width, out.height);
    } else if (bg === "gray") {
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(0, 0, out.width, out.height);
    }
    ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h, 0, 0, targetW, targetH);
    try {
      const blob = await canvasToBlobUnderKb(out, maxKb, bg === "transparent");
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      toast.success("Photo resized");
    } catch {
      toast.error("Could not resize this photo");
    }
  };

  const download = () => {
    if (!resultBlob) return;
    const ext = resultBlob.type === "image/png" ? "png" : "jpg";
    downloadBlob(resultBlob, `${preset.id === "custom" ? "resized" : preset.id}-photo.${ext}`);
  };

  const reset = () => {
    setFile(null);
    setImage(null);
    setResultBlob(null);
    setResultUrl(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Document Presets</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setPresetId(item.id);
                setResultBlob(null);
                setResultUrl(null);
              }}
              className={cn(
                "rounded-lg border px-3 py-2 text-left transition-colors",
                presetId === item.id ? "border-primary bg-surface-card" : "border-[var(--hairline)] hover:border-primary/50",
              )}
            >
              <span className="block text-sm font-medium text-ink">{item.name}</span>
              <span className="mt-0.5 block text-xs text-[var(--muted-ink)]">
                {item.id === "custom" ? "Custom Size - set your own width, height, and file size" : `${item.width} × ${item.height}px · max ${item.maxKb}KB`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {preset.id === "custom" ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="resize-w">Width (px)</Label>
            <Input id="resize-w" type="number" min={1} value={customW} onChange={(event) => setCustomW(Number(event.target.value) || 1)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resize-h">Height (px)</Label>
            <Input id="resize-h" type="number" min={1} value={customH} onChange={(event) => setCustomH(Number(event.target.value) || 1)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resize-kb">Max KB</Label>
            <Input id="resize-kb" type="number" min={0} value={customKb} onChange={(event) => setCustomKb(Number(event.target.value) || 0)} />
          </div>
        </div>
      ) : null}

      <Dropzone
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        maxSizeMB={10}
        files={file ? [file] : []}
        onFiles={(files) => {
          setFile(files[0] ?? null);
          setResultBlob(null);
          setResultUrl(null);
        }}
        onRemove={reset}
        label="Drop your photo here"
        hint="or click to browse - max 10MB"
      />

      <div className="space-y-2">
        <Label>Background Color</Label>
        <div className="flex flex-wrap gap-2">
          {([
            ["white", "White"],
            ["gray", "Light Gray"],
            ["transparent", "Transparent"],
          ] as const).map(([id, label]) => (
            <Button key={id} size="sm" variant={bg === id ? "default" : "outline"} onClick={() => setBg(id)}>
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5">
          <p className="mb-2 text-xs font-medium text-[var(--muted-ink)]">Original</p>
          {image ? (
            <canvas
              ref={canvasRef}
              className="mx-auto max-w-full cursor-move touch-none"
              onPointerDown={(event) => {
                const canvas = canvasRef.current;
                if (!canvas || !image) return;
                const rect = canvas.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * image.width;
                const y = ((event.clientY - rect.top) / rect.height) * image.height;
                drag.current = { dx: x - crop.x, dy: y - crop.y };
                (event.target as HTMLCanvasElement).setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (!drag.current || !image) return;
                const canvas = canvasRef.current;
                if (!canvas) return;
                const rect = canvas.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * image.width - drag.current.dx;
                const y = ((event.clientY - rect.top) / rect.height) * image.height - drag.current.dy;
                setCrop((current) => ({
                  ...current,
                  x: Math.min(Math.max(0, x), image.width - current.w),
                  y: Math.min(Math.max(0, y), image.height - current.h),
                }));
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
            />
          ) : (
            <p className="py-10 text-center text-sm text-[var(--muted-ink)]">Upload a photo to start cropping.</p>
          )}
        </div>
        <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5">
          <p className="mb-2 text-xs font-medium text-[var(--muted-ink)]">Resized</p>
          {resultUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resultUrl} alt="Resized preview" className="mx-auto max-h-80 object-contain" />
          ) : (
            <p className="py-10 text-center text-sm text-[var(--muted-ink)]">{targetW} × {targetH}px</p>
          )}
        </div>
      </div>

      {!resultBlob ? (
        <Button onClick={exportCrop} disabled={!image} className="w-full">
          Resize Photo
        </Button>
      ) : (
        <>
          <Button onClick={download} className="w-full">
            Download Photo
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-[var(--muted-ink)] transition-colors hover:text-ink"
            onClick={reset}
          >
            Resize Another
          </button>
        </>
      )}
    </div>
  );
}
