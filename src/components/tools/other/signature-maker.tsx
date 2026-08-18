"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadBlob } from "@/lib/utils";

const FONTS = [
  { id: "Dancing Script", label: "Dancing Script" },
  { id: "Great Vibes", label: "Great Vibes" },
  { id: "Pacifico", label: "Pacifico" },
  { id: "Satisfy", label: "Satisfy" },
  { id: "Caveat", label: "Caveat" },
];

const COLORS = ["#141413", "#cc785c", "#1f4b99", "#1f7a4d", "#8a1f1f"];

type Mode = "draw" | "type" | "upload";

export function SignatureMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [mode, setMode] = useState<Mode>("draw");
  const [color, setColor] = useState("#141413");
  const [thickness, setThickness] = useState(2.5);
  const [typed, setTyped] = useState("Your Name");
  const [font, setFont] = useState(FONTS[0].id);

  useEffect(() => {
    if (document.getElementById("signature-fonts")) return;
    const link = document.createElement("link");
    link.id = "signature-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Caveat:wght@500&family=Dancing+Script:wght@500&family=Great+Vibes&family=Pacifico&family=Satisfy&display=swap";
    document.head.appendChild(link);
  }, []);

  const clearCanvas = (fill = "#ffffff") => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (mode === "type") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `72px "${font}", cursive`;
      ctx.fillText(typed || "Your Name", canvas.width / 2, canvas.height / 2);
      return;
    }
    if (mode === "draw") {
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, [color, font, mode, thickness, typed]);

  useEffect(() => {
    if (mode === "draw") clearCanvas();
  }, [mode]);

  const pos = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const download = (type: "image/png" | "image/jpeg") => {
    canvasRef.current?.toBlob((blob) => {
      if (blob) downloadBlob(blob, type === "image/png" ? "signature.png" : "signature.jpg");
    }, type);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["draw", "type", "upload"] as const).map((item) => (
          <Button key={item} type="button" size="sm" variant={mode === item ? "default" : "outline"} onClick={() => setMode(item)}>
            {item === "draw" ? "Draw" : item === "type" ? "Type" : "Upload"}
          </Button>
        ))}
      </div>

      {mode === "type" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="signature-text">Signature text</Label>
            <Input id="signature-text" value={typed} onChange={(e) => setTyped(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="signature-font">Font</Label>
            <select
              id="signature-font"
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm"
            >
              {FONTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {mode === "upload" ? (
        <div>
          <Label htmlFor="signature-upload">Upload signature image</Label>
          <Input
            id="signature-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="mt-1"
            onChange={(event) => {
              const file = event.target.files?.[0];
              const canvas = canvasRef.current;
              const ctx = canvas?.getContext("2d");
              if (!file || !canvas || !ctx) return;
              const url = URL.createObjectURL(file);
              const image = new Image();
              image.onload = () => {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
                const w = image.width * scale;
                const h = image.height * scale;
                ctx.drawImage(image, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
                URL.revokeObjectURL(url);
              };
              image.src = url;
            }}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label>Color</Label>
          {COLORS.map((item) => (
            <button
              key={item}
              type="button"
              aria-label={`Use color ${item}`}
              className={`h-7 w-7 rounded-full border ${color === item ? "ring-2 ring-primary ring-offset-2" : "border-[var(--hairline)]"}`}
              style={{ backgroundColor: item }}
              onClick={() => setColor(item)}
            />
          ))}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0" />
        </div>
        {mode === "draw" ? (
          <div className="flex items-center gap-2">
            <Label htmlFor="pen-size">Thickness</Label>
            <input id="pen-size" type="range" min={1} max={8} step={0.5} value={thickness} onChange={(e) => setThickness(Number(e.target.value))} />
          </div>
        ) : null}
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={280}
        className="h-56 w-full touch-none rounded-lg border border-[var(--hairline)] bg-white"
        onPointerDown={(event) => {
          if (mode !== "draw") return;
          drawing.current = true;
          const ctx = canvasRef.current?.getContext("2d");
          if (!ctx) return;
          ctx.strokeStyle = color;
          ctx.lineWidth = thickness;
          const { x, y } = pos(event);
          ctx.beginPath();
          ctx.moveTo(x, y);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (mode !== "draw" || !drawing.current) return;
          const ctx = canvasRef.current?.getContext("2d");
          if (!ctx) return;
          const { x, y } = pos(event);
          ctx.lineTo(x, y);
          ctx.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
        }}
      />

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => clearCanvas()}>
          Clear
        </Button>
        <Button type="button" onClick={() => download("image/png")}>
          Download PNG
        </Button>
        <Button type="button" variant="outline" onClick={() => download("image/jpeg")}>
          Download JPG
        </Button>
      </div>
    </div>
  );
}
