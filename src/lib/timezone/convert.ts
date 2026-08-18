export type TimeFormat = "12" | "24";
export type Disambiguation = "earlier" | "later";
export type DateRelation = "previous" | "same" | "next";

export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export type ConversionWarning =
  | { type: "nonexistent"; message: string }
  | { type: "ambiguous"; message: string; disambiguation: Disambiguation };

export type ConvertedResult = {
  timeZone: string;
  instant: Date;
  time: string;
  date: string;
  dateLabel: DateRelation;
  dateLabelText: string;
  abbreviation: string;
  offset: string;
  offsetLabel: string;
  warning?: ConversionWarning;
};

export type SourceConversion = {
  instant: Date | null;
  warning?: ConversionWarning;
  error?: string;
};

export const TIMEZONE_FAQS = [
  {
    question: "What is a time zone converter?",
    answer:
      "A time zone converter translates a date and time from one region to another using real IANA time zone rules, including daylight saving changes.",
  },
  {
    question: "How do I convert IST to EST?",
    answer:
      "Select Asia/Kolkata as the source time zone, enter your date and time, then add America/New_York as a destination. The tool shows the converted time with the correct UTC offset for that date.",
  },
  {
    question: "Does the converter account for daylight saving time?",
    answer:
      "Yes. Offsets and abbreviations are calculated from the selected date using the browser's Intl time zone data, so DST transitions are handled automatically.",
  },
  {
    question: "What is UTC?",
    answer:
      "UTC (Coordinated Universal Time) is the global time standard. Time zones are expressed as offsets from UTC, such as UTC+05:30 for India Standard Time.",
  },
  {
    question: "Why does the date change when converting time zones?",
    answer:
      "When the time difference crosses midnight, the calendar date in the destination city can be the previous day, the same day, or the next day relative to your source date.",
  },
  {
    question: "What is the difference between UTC and GMT?",
    answer:
      "For practical purposes they are often treated the same, but UTC is a precise atomic-time standard while GMT is a time zone name often used in the UK during winter.",
  },
  {
    question: "How accurate are time zone conversions?",
    answer:
      "Conversions use IANA time zone identifiers and the same Intl APIs modern browsers use for local time. Accuracy depends on the underlying time zone database in your browser.",
  },
  {
    question: "Why does New York have different UTC offsets during the year?",
    answer:
      "New York observes daylight saving time, switching between EST (UTC−05:00) and EDT (UTC−04:00) depending on the date.",
  },
] as const;

const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(options: Intl.DateTimeFormatOptions) {
  const key = JSON.stringify(options);
  const cached = dateFormatterCache.get(key);
  if (cached) return cached;
  const formatter = new Intl.DateTimeFormat("en-US", options);
  dateFormatterCache.set(key, formatter);
  return formatter;
}

export function isValidTimeZone(timeZone: string) {
  if (!timeZone || typeof timeZone !== "string") return false;
  try {
    getFormatter({ timeZone, hour: "numeric" }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function getBrowserTimeZone() {
  if (typeof Intl === "undefined") return "UTC";
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function parseDateInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (![year, month, day].every(Number.isFinite)) return null;
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

export function parseTimeInput(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || hour > 23 || minute > 59) return null;
  return { hour, minute };
}

export function getZonedParts(instant: Date, timeZone: string): ZonedParts {
  const parts = getFormatter({
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? NaN);
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
  };
}

function partsMatch(a: ZonedParts, b: ZonedParts) {
  return a.year === b.year && a.month === b.month && a.day === b.day && a.hour === b.hour && a.minute === b.minute;
}

function normalizeOffset(raw: string) {
  const cleaned = raw.replace(/\s/g, "").replace(/GMT/gi, "UTC").replace(/UTCUTC/gi, "UTC");
  const match = /^UTC([+-])(\d{1,2})(?::?(\d{2}))?$/i.exec(cleaned);
  if (!match) return cleaned.replace(/gmt/i, "UTC");
  const sign = match[1];
  const hours = match[2].padStart(2, "0");
  const minutes = (match[3] ?? "00").padStart(2, "0");
  return `UTC${sign}${hours}:${minutes}`;
}

export function getUtcOffset(instant: Date, timeZone: string) {
  const raw =
    getFormatter({ timeZone, timeZoneName: "longOffset" })
      .formatToParts(instant)
      .find((part) => part.type === "timeZoneName")?.value ?? "UTC";
  return normalizeOffset(raw);
}

export function getTimeZoneAbbreviation(instant: Date, timeZone: string) {
  return (
    getFormatter({ timeZone, timeZoneName: "short" })
      .formatToParts(instant)
      .find((part) => part.type === "timeZoneName")?.value ?? "UTC"
  );
}

export function getOffsetLabel(instant: Date, timeZone: string) {
  const abbreviation = getTimeZoneAbbreviation(instant, timeZone);
  const offset = getUtcOffset(instant, timeZone);
  return `${abbreviation} · ${offset}`;
}

export function formatDisplayDate(parts: ZonedParts) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return getFormatter({ month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function formatDisplayTime(parts: ZonedParts, format: TimeFormat) {
  const hour24 = parts.hour;
  const minute = parts.minute;
  if (format === "24") {
    return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

export function toIsoDate(parts: Pick<ZonedParts, "year" | "month" | "day">) {
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function compareDateRelation(sourceDate: string, destinationParts: ZonedParts): DateRelation {
  const destinationDate = toIsoDate(destinationParts);
  if (destinationDate < sourceDate) return "previous";
  if (destinationDate > sourceDate) return "next";
  return "same";
}

export function dateRelationLabel(relation: DateRelation) {
  if (relation === "previous") return "Previous day";
  if (relation === "next") return "Next day";
  return "Today";
}

export function findWallTimeInstants(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
) {
  const target: ZonedParts = { year, month, day, hour, minute };
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  const found: Date[] = [];

  for (let delta = -14 * 60; delta <= 14 * 60; delta += 1) {
    const instant = new Date(utcGuess + delta * 60_000);
    const parts = getZonedParts(instant, timeZone);
    if (!partsMatch(parts, target)) continue;
    if (!found.some((existing) => Math.abs(existing.getTime() - instant.getTime()) < 30_000)) {
      found.push(instant);
    }
  }

  return found.sort((a, b) => a.getTime() - b.getTime());
}

export function wallTimeToInstant(
  date: string,
  time: string,
  timeZone: string,
  disambiguation: Disambiguation = "earlier",
): SourceConversion {
  if (!isValidTimeZone(timeZone)) {
    return { instant: null, error: "Select a valid time zone." };
  }

  const parsedDate = parseDateInput(date);
  if (!parsedDate) return { instant: null, error: "Enter a valid date." };

  const parsedTime = parseTimeInput(time);
  if (!parsedTime) return { instant: null, error: "Enter a valid time in HH:MM format." };

  const candidates = findWallTimeInstants(
    parsedDate.year,
    parsedDate.month,
    parsedDate.day,
    parsedTime.hour,
    parsedTime.minute,
    timeZone,
  );

  if (candidates.length === 0) {
    return {
      instant: null,
      warning: {
        type: "nonexistent",
        message:
          "This local time does not exist in the selected time zone because of a daylight saving transition. Choose a different time.",
      },
      error: "This local time does not exist in the selected time zone.",
    };
  }

  if (candidates.length > 1) {
    const instant = disambiguation === "later" ? candidates[candidates.length - 1] : candidates[0];
    return {
      instant,
      warning: {
        type: "ambiguous",
        message:
          "This local time occurs twice because clocks move back for daylight saving. Showing the earlier occurrence by default.",
        disambiguation,
      },
    };
  }

  return { instant: candidates[0] };
}

export function instantToConvertedResult(
  instant: Date,
  timeZone: string,
  sourceDate: string,
  format: TimeFormat,
): ConvertedResult | null {
  if (!isValidTimeZone(timeZone)) return null;
  const parts = getZonedParts(instant, timeZone);
  const relation = compareDateRelation(sourceDate, parts);
  return {
    timeZone,
    instant,
    time: formatDisplayTime(parts, format),
    date: formatDisplayDate(parts),
    dateLabel: relation,
    dateLabelText: dateRelationLabel(relation),
    abbreviation: getTimeZoneAbbreviation(instant, timeZone),
    offset: getUtcOffset(instant, timeZone),
    offsetLabel: getOffsetLabel(instant, timeZone),
  };
}

export function convertAcrossTimeZones(input: {
  sourceDate: string;
  sourceTime: string;
  sourceTimeZone: string;
  destinationTimeZones: string[];
  format: TimeFormat;
  disambiguation?: Disambiguation;
}) {
  const source = wallTimeToInstant(
    input.sourceDate,
    input.sourceTime,
    input.sourceTimeZone,
    input.disambiguation ?? "earlier",
  );

  if (!source.instant) {
    return {
      source,
      results: [] as ConvertedResult[],
    };
  }

  const uniqueDestinations = [...new Set(input.destinationTimeZones.filter(isValidTimeZone))];
  const results = uniqueDestinations
    .map((timeZone) => instantToConvertedResult(source.instant!, timeZone, input.sourceDate, input.format))
    .filter((result): result is ConvertedResult => result !== null);

  return { source, results };
}

export function getNowInTimeZone(timeZone: string, format: TimeFormat) {
  if (!isValidTimeZone(timeZone)) return null;
  const instant = new Date();
  const parts = getZonedParts(instant, timeZone);
  return {
    date: toIsoDate(parts),
    time: `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`,
    displayTime: formatDisplayTime(parts, format),
    offsetLabel: getOffsetLabel(instant, timeZone),
    instant,
  };
}

export function getCurrentLocalDateTime() {
  const now = new Date();
  const parts = getZonedParts(now, getBrowserTimeZone());
  return {
    date: toIsoDate(parts),
    time: `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`,
    timeZone: getBrowserTimeZone(),
  };
}

export function sanitizeTimeZoneList(values: string[] | null | undefined, fallback: string[]) {
  if (!values?.length) return [...fallback];
  const valid = values.filter(isValidTimeZone);
  return valid.length ? valid.slice(0, 8) : [...fallback];
}

export function sanitizeTimeFormat(value: string | null | undefined): TimeFormat {
  return value === "24" ? "24" : "12";
}

export function sanitizeDisambiguation(value: string | null | undefined): Disambiguation {
  return value === "later" ? "later" : "earlier";
}
