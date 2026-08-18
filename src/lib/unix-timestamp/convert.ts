import {
  getBrowserTimeZone,
  getOffsetLabel,
  getTimeZoneAbbreviation,
  getUtcOffset,
  isValidTimeZone,
  wallTimeToInstant,
} from "@/lib/timezone/convert";
import { getTimeZoneLabel } from "@/lib/timezone/data";

export type TimestampUnit = "auto" | "seconds" | "milliseconds";
export type DetectedUnit = "seconds" | "milliseconds";

export type TimestampParseOk = {
  ok: true;
  milliseconds: number;
  seconds: number;
  detected: DetectedUnit;
};

export type TimestampParseErr = { ok: false; error: string };
export type TimestampParse = TimestampParseOk | TimestampParseErr;

export type ConvertedInstant = {
  date: string;
  isoDate: string;
  time: string;
  weekday: string;
  timeZone: string;
  timeZoneLabel: string;
  offset: string;
  abbreviation: string;
  seconds: number;
  milliseconds: number;
  isoUtc: string;
};

export const JS_DATE_MAX_MS = 8.64e15;

export const TIMESTAMP_EXAMPLES = [
  { label: "Unix epoch", value: "0", hint: "1 Jan 1970 00:00:00 UTC" },
  { label: "1 billion s", value: "1000000000", hint: "9 Sep 2001 01:46:40 UTC" },
  { label: "2021 New Year", value: "1609459200", hint: "1 Jan 2021 00:00:00 UTC" },
  { label: "2024 in ms", value: "1704067200000", hint: "1 Jan 2024 00:00:00 UTC" },
] as const;

export const UNIX_TIMESTAMP_FAQS = [
  {
    question: "What is a Unix timestamp?",
    answer:
      "A Unix timestamp (epoch time) is the number of seconds — or milliseconds — since 1 January 1970 00:00:00 UTC, not counting leap seconds.",
  },
  {
    question: "How do I know if a timestamp is in seconds or milliseconds?",
    answer:
      "Seconds are usually 10 digits around the present day (about 1.7 billion). Milliseconds are usually 13 digits. Auto mode uses length: values of 1e11 or more are treated as milliseconds.",
  },
  {
    question: "Does the converter use my time zone?",
    answer:
      "Yes. Pick UTC, your local zone, or any IANA time zone. The same instant is shown as a local date and time in that zone, including daylight saving offsets.",
  },
  {
    question: "Can I convert a date back to epoch time?",
    answer:
      "Yes. Enter a date, time, and time zone in the Date → Timestamp section. The result is the Unix time in both seconds and milliseconds.",
  },
  {
    question: "Is the Unix Timestamp Converter free?",
    answer: "Yes. It runs in your browser with no signup. Values stay on your device.",
  },
] as const;

const partFormatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string) {
  const cached = partFormatterCache.get(timeZone);
  if (cached) return cached;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  partFormatterCache.set(timeZone, formatter);
  return formatter;
}

function readPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((part) => part.type === type)?.value ?? "";
}

export function detectTimestampUnit(value: number): DetectedUnit {
  return Math.abs(value) >= 1e11 ? "milliseconds" : "seconds";
}

export function parseTimestampInput(raw: string, unit: TimestampUnit = "auto"): TimestampParse {
  const cleaned = raw.trim().replace(/[,_\s]/g, "");
  if (!cleaned) return { ok: false, error: "Enter a Unix timestamp." };
  if (!/^-?\d+(?:\.\d+)?$/.test(cleaned)) {
    return { ok: false, error: "Use digits only. A decimal is allowed for fractional seconds." };
  }
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return { ok: false, error: "This does not look like a valid timestamp." };

  const detected: DetectedUnit = unit === "auto" ? detectTimestampUnit(value) : unit;
  const milliseconds = detected === "milliseconds" ? value : value * 1000;
  if (!Number.isFinite(milliseconds) || Math.abs(milliseconds) > JS_DATE_MAX_MS) {
    return { ok: false, error: "This timestamp is outside the supported date range." };
  }
  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "This timestamp is outside the supported date range." };
  }
  return {
    ok: true,
    milliseconds,
    seconds: Math.trunc(milliseconds / 1000),
    detected,
  };
}

export function resolveTimeZone(timeZone: string) {
  if (timeZone === "local") return getBrowserTimeZone();
  return isValidTimeZone(timeZone) ? timeZone : "UTC";
}

export function formatInstant(ms: number, timeZone: string): ConvertedInstant | { error: string } {
  const zone = resolveTimeZone(timeZone);
  if (!isValidTimeZone(zone)) return { error: "Select a valid time zone." };
  const instant = new Date(ms);
  if (Number.isNaN(instant.getTime())) return { error: "This timestamp is outside the supported date range." };

  const parts = getFormatter(zone).formatToParts(instant);
  const year = readPart(parts, "year");
  const month = readPart(parts, "month");
  const day = readPart(parts, "day");
  const hour = readPart(parts, "hour").padStart(2, "0");
  const minute = readPart(parts, "minute").padStart(2, "0");
  const second = readPart(parts, "second").padStart(2, "0");
  const numeric = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);

  const offsetRaw = getUtcOffset(instant, zone);
  const offset = offsetRaw === "UTC" || offsetRaw === "GMT" ? "UTC+00:00" : offsetRaw;

  return {
    date: `${month} ${day}, ${year}`,
    isoDate: numeric,
    time: `${hour}:${minute}:${second}`,
    weekday: readPart(parts, "weekday"),
    timeZone: zone,
    timeZoneLabel: getTimeZoneLabel(zone),
    offset,
    abbreviation: getTimeZoneAbbreviation(instant, zone),
    seconds: Math.trunc(instant.getTime() / 1000),
    milliseconds: instant.getTime(),
    isoUtc: instant.toISOString(),
  };
}

export function timestampToDate(raw: string, unit: TimestampUnit, timeZone: string) {
  const parsed = parseTimestampInput(raw, unit);
  if (!parsed.ok) return parsed;
  const formatted = formatInstant(parsed.milliseconds, timeZone);
  if ("error" in formatted) return { ok: false as const, error: formatted.error };
  return { ok: true as const, parsed, result: formatted };
}

export function parseTimeWithSeconds(value: string) {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] ?? "0");
  if (hour > 23 || minute > 59 || second > 59) return null;
  if (![hour, minute, second].every(Number.isFinite)) return null;
  return { hour, minute, second };
}

export function dateTimeToUnix(date: string, time: string, timeZone: string) {
  const zone = resolveTimeZone(timeZone);
  const parsedTime = parseTimeWithSeconds(time);
  if (!date.trim()) return { ok: false as const, error: "Enter a date." };
  if (!parsedTime) return { ok: false as const, error: "Enter a valid time as HH:MM or HH:MM:SS." };

  const hhmm = `${String(parsedTime.hour).padStart(2, "0")}:${String(parsedTime.minute).padStart(2, "0")}`;
  const converted = wallTimeToInstant(date, hhmm, zone, "earlier");
  if (!converted.instant) {
    return { ok: false as const, error: converted.error ?? "Could not convert this date and time." };
  }

  const milliseconds = converted.instant.getTime() + parsedTime.second * 1000;
  const formatted = formatInstant(milliseconds, zone);
  if ("error" in formatted) return { ok: false as const, error: formatted.error };
  return {
    ok: true as const,
    result: formatted,
    warning: converted.warning?.message,
  };
}

export function formatNow(timeZone: string, now = Date.now()) {
  return formatInstant(now, timeZone);
}

export function resultCopyText(result: ConvertedInstant) {
  return [
    `Date: ${result.date}`,
    `Time: ${result.time}`,
    `Day of week: ${result.weekday}`,
    `Timezone: ${result.timeZoneLabel} (${result.abbreviation} · ${result.offset})`,
    `Unix (seconds): ${result.seconds}`,
    `Unix (milliseconds): ${result.milliseconds}`,
    `ISO 8601 (UTC): ${result.isoUtc}`,
  ].join("\n");
}

export function zoneHint(instant: Date, timeZone: string) {
  const zone = resolveTimeZone(timeZone);
  return `${getTimeZoneLabel(zone)} · ${getOffsetLabel(instant, zone)}`;
}
