import type { Disambiguation, TimeFormat } from "./convert";

export const TIMEZONE_STORAGE_KEY = "toolhub-timezone-v1";

export type TimeZonePreferences = {
  version: 1;
  timeFormat: TimeFormat;
  favorites: string[];
  recent: string[];
  lastDestinations: string[];
  disambiguation: Disambiguation;
};

export function createDefaultPreferences(): TimeZonePreferences {
  return {
    version: 1,
    timeFormat: "12",
    favorites: [],
    recent: [],
    lastDestinations: ["America/New_York", "Europe/London", "Asia/Tokyo"],
    disambiguation: "earlier",
  };
}

function sanitizeStringArray(values: unknown, max: number) {
  if (!Array.isArray(values)) return [];
  return values.filter((value): value is string => typeof value === "string").slice(0, max);
}

export function loadTimeZonePreferences(): TimeZonePreferences {
  if (typeof window === "undefined") return createDefaultPreferences();
  try {
    const raw = window.localStorage.getItem(TIMEZONE_STORAGE_KEY);
    if (!raw) return createDefaultPreferences();
    const parsed = JSON.parse(raw) as Partial<TimeZonePreferences>;
    const defaults = createDefaultPreferences();
    return {
      version: 1,
      timeFormat: parsed.timeFormat === "24" ? "24" : "12",
      favorites: sanitizeStringArray(parsed.favorites, 12),
      recent: sanitizeStringArray(parsed.recent, 12),
      lastDestinations: sanitizeStringArray(parsed.lastDestinations, 8).length
        ? sanitizeStringArray(parsed.lastDestinations, 8)
        : defaults.lastDestinations,
      disambiguation: parsed.disambiguation === "later" ? "later" : "earlier",
    };
  } catch {
    return createDefaultPreferences();
  }
}

export function saveTimeZonePreferences(preferences: TimeZonePreferences) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TIMEZONE_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    /* storage unavailable */
  }
}

export function pushRecentTimeZone(recent: string[], timeZone: string, max = 8) {
  return [timeZone, ...recent.filter((item) => item !== timeZone)].slice(0, max);
}

export function toggleFavoriteTimeZone(favorites: string[], timeZone: string, max = 12) {
  if (favorites.includes(timeZone)) {
    return favorites.filter((item) => item !== timeZone);
  }
  return [timeZone, ...favorites].slice(0, max);
}
