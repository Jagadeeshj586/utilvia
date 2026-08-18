"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  cmykToRgb,
  formatsFromHex,
  formatsFromHsv,
  hexToRgb,
  hslToRgb,
  normalizeHex,
  rgbToHex,
  rgbToHsv,
} from "@/lib/color/conversion";
import { pushColorHistory } from "@/lib/color/storage";
import type { CMYK, ColorFormats, HSL, HSV, RGB } from "@/lib/color/types";

const DEFAULT_HEX = "#cc785c";

function hsvFromHex(hex: string, alpha = 1) {
  const formats = formatsFromHex(hex, alpha);
  if (!formats) return null;
  return { hsv: formats.hsv, alpha: formats.alpha };
}

function readColorFromUrl() {
  if (typeof window === "undefined") return null;
  const color = new URLSearchParams(window.location.search).get("color");
  if (!color) return null;
  return hsvFromHex(color.startsWith("#") ? color : `#${color}`);
}

export function useColorPicker() {
  const initialized = useRef(false);
  const historyTimer = useRef<number | null>(null);

  const initial = useMemo(() => readColorFromUrl() ?? hsvFromHex(DEFAULT_HEX)!, []);

  const [hsv, setHsv] = useState<HSV>(initial.hsv);
  const [alpha, setAlphaState] = useState(initial.alpha);

  const formats = useMemo(() => formatsFromHsv(hsv.h, hsv.s, hsv.v, alpha), [alpha, hsv]);

  const syncUrl = useCallback((hex: string) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("color", hex.replace("#", "").slice(0, 6));
    window.history.replaceState({}, "", url.toString());
  }, []);

  const scheduleHistory = useCallback((next: ColorFormats) => {
    if (historyTimer.current) window.clearTimeout(historyTimer.current);
    historyTimer.current = window.setTimeout(() => {
      pushColorHistory({ hex: next.hex.slice(0, 7), alpha: next.alpha });
    }, 600);
  }, []);

  const applyHsv = useCallback(
    (next: HSV, nextAlpha = alpha) => {
      setHsv(next);
      const computed = formatsFromHsv(next.h, next.s, next.v, nextAlpha);
      syncUrl(computed.hex);
      scheduleHistory(computed);
    },
    [alpha, scheduleHistory, syncUrl],
  );

  const setAlpha = useCallback(
    (value: number) => {
      const nextAlpha = Math.min(1, Math.max(0, value));
      setAlphaState(nextAlpha);
      const computed = formatsFromHsv(hsv.h, hsv.s, hsv.v, nextAlpha);
      syncUrl(computed.hex);
      scheduleHistory(computed);
    },
    [hsv, scheduleHistory, syncUrl],
  );

  const setFromRgb = useCallback(
    (rgb: RGB, nextAlpha = alpha) => {
      const nextHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setHsv(nextHsv);
      setAlphaState(nextAlpha);
      const computed = formatsFromHsv(nextHsv.h, nextHsv.s, nextHsv.v, nextAlpha);
      syncUrl(computed.hex);
      scheduleHistory(computed);
    },
    [alpha, scheduleHistory, syncUrl],
  );

  const setFromHsl = useCallback(
    (hsl: HSL, nextAlpha = alpha) => {
      setFromRgb(hslToRgb(hsl.h, hsl.s, hsl.l), nextAlpha);
    },
    [alpha, setFromRgb],
  );

  const setFromHsv = useCallback(
    (next: HSV, nextAlpha = alpha) => {
      applyHsv(next, nextAlpha);
      setAlphaState(nextAlpha);
    },
    [alpha, applyHsv],
  );

  const setFromCmyk = useCallback(
    (cmyk: CMYK, nextAlpha = alpha) => {
      setFromRgb(cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k), nextAlpha);
    },
    [alpha, setFromRgb],
  );

  const setFromHex = useCallback(
    (input: string, nextAlpha?: number) => {
      const normalized = normalizeHex(input);
      if (!normalized) return false;
      const parsedAlpha = nextAlpha ?? (normalized.length === 9 ? parseInt(normalized.slice(7, 9), 16) / 255 : alpha);
      const rgb = hexToRgb(normalized);
      if (!rgb) return false;
      setFromRgb(rgb, parsedAlpha);
      return true;
    },
    [alpha, setFromRgb],
  );

  const reset = useCallback(() => {
    const base = hsvFromHex(DEFAULT_HEX)!;
    setHsv(base.hsv);
    setAlphaState(base.alpha);
    syncUrl(DEFAULT_HEX);
  }, [syncUrl]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const fromUrl = readColorFromUrl();
    if (fromUrl) {
      setHsv(fromUrl.hsv);
      setAlphaState(fromUrl.alpha);
    }
  }, []);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.searchParams.set("color", formats.hex.replace("#", "").slice(0, 6));
    return url.toString();
  }, [formats.hex]);

  return {
    formats,
    hsv,
    alpha,
    setHue: (h: number) => applyHsv({ ...hsv, h }),
    setSaturation: (s: number) => applyHsv({ ...hsv, s }),
    setValue: (v: number) => applyHsv({ ...hsv, v }),
    setHsv: applyHsv,
    setAlpha,
    setFromHex,
    setFromRgb,
    setFromHsl,
    setFromHsv,
    setFromCmyk,
    reset,
    shareUrl,
    previewHex: rgbToHex(formats.rgb.r, formats.rgb.g, formats.rgb.b, alpha),
  };
}

export function nudgeHsv(hsv: HSV, axis: "h" | "s" | "v", delta: number): HSV {
  if (axis === "h") return { ...hsv, h: (hsv.h + delta + 360) % 360 };
  if (axis === "s") return { ...hsv, s: Math.min(100, Math.max(0, hsv.s + delta)) };
  return { ...hsv, v: Math.min(100, Math.max(0, hsv.v + delta)) };
}
