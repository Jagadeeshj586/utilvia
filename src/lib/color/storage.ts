import type { StoredColor } from "./types";

const HISTORY_KEY = "toolhub-color-history";
const FAVORITES_KEY = "toolhub-color-favorites";
const MAX_HISTORY = 20;

function read(key: string): StoredColor[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredColor[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(key: string, value: StoredColor[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export function loadColorHistory() {
  return read(HISTORY_KEY);
}

export function pushColorHistory(entry: Omit<StoredColor, "savedAt">) {
  const next = [{ ...entry, savedAt: Date.now() }, ...loadColorHistory().filter((item) => item.hex !== entry.hex)].slice(
    0,
    MAX_HISTORY,
  );
  write(HISTORY_KEY, next);
  return next;
}

export function clearColorHistory() {
  write(HISTORY_KEY, []);
}

export function loadFavorites() {
  return read(FAVORITES_KEY);
}

export function toggleFavorite(entry: Omit<StoredColor, "savedAt">) {
  const current = loadFavorites();
  const exists = current.some((item) => item.hex === entry.hex);
  const next = exists
    ? current.filter((item) => item.hex !== entry.hex)
    : [{ ...entry, savedAt: Date.now() }, ...current];
  write(FAVORITES_KEY, next);
  return next;
}

export function removeFavorite(hex: string) {
  const next = loadFavorites().filter((item) => item.hex !== hex);
  write(FAVORITES_KEY, next);
  return next;
}

export function clearLocalColorData() {
  clearColorHistory();
  write(FAVORITES_KEY, []);
}
