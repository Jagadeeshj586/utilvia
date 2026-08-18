export type TimeZoneEntry = {
  id: string;
  city: string;
  country: string;
  region: string;
  /** Extra search terms such as abbreviations or aliases */
  aliases?: string[];
};

/** Curated IANA zones grouped for search UX — offsets are never stored here. */
export const TIMEZONE_CATALOG: TimeZoneEntry[] = [
  // UTC
  { id: "UTC", city: "UTC", country: "Coordinated Universal Time", region: "UTC", aliases: ["GMT", "Zulu"] },

  // United States
  { id: "America/New_York", city: "New York", country: "United States", region: "United States", aliases: ["EST", "EDT", "NYC"] },
  { id: "America/Los_Angeles", city: "Los Angeles", country: "United States", region: "United States", aliases: ["PST", "PDT", "LA"] },
  { id: "America/Chicago", city: "Chicago", country: "United States", region: "United States", aliases: ["CST", "CDT"] },
  { id: "America/Denver", city: "Denver", country: "United States", region: "United States", aliases: ["MST", "MDT"] },
  { id: "America/Phoenix", city: "Phoenix", country: "United States", region: "United States", aliases: ["Arizona"] },
  { id: "America/Anchorage", city: "Anchorage", country: "United States", region: "United States", aliases: ["AKST", "AKDT"] },
  { id: "Pacific/Honolulu", city: "Honolulu", country: "United States", region: "United States", aliases: ["HST", "Hawaii"] },

  // Canada
  { id: "America/Toronto", city: "Toronto", country: "Canada", region: "Americas" },
  { id: "America/Vancouver", city: "Vancouver", country: "Canada", region: "Americas" },

  // Latin America
  { id: "America/Mexico_City", city: "Mexico City", country: "Mexico", region: "Americas" },
  { id: "America/Sao_Paulo", city: "São Paulo", country: "Brazil", region: "Americas" },
  { id: "America/Buenos_Aires", city: "Buenos Aires", country: "Argentina", region: "Americas" },

  // Europe
  { id: "Europe/London", city: "London", country: "United Kingdom", region: "Europe", aliases: ["GMT", "BST", "UK"] },
  { id: "Europe/Paris", city: "Paris", country: "France", region: "Europe", aliases: ["CET", "CEST"] },
  { id: "Europe/Berlin", city: "Berlin", country: "Germany", region: "Europe" },
  { id: "Europe/Amsterdam", city: "Amsterdam", country: "Netherlands", region: "Europe" },
  { id: "Europe/Madrid", city: "Madrid", country: "Spain", region: "Europe" },
  { id: "Europe/Rome", city: "Rome", country: "Italy", region: "Europe" },
  { id: "Europe/Zurich", city: "Zurich", country: "Switzerland", region: "Europe" },
  { id: "Europe/Stockholm", city: "Stockholm", country: "Sweden", region: "Europe" },
  { id: "Europe/Moscow", city: "Moscow", country: "Russia", region: "Europe" },
  { id: "Europe/Istanbul", city: "Istanbul", country: "Turkey", region: "Europe" },

  // Middle East & Africa
  { id: "Asia/Dubai", city: "Dubai", country: "United Arab Emirates", region: "Middle East", aliases: ["GST"] },
  { id: "Asia/Riyadh", city: "Riyadh", country: "Saudi Arabia", region: "Middle East" },
  { id: "Africa/Cairo", city: "Cairo", country: "Egypt", region: "Africa" },
  { id: "Africa/Johannesburg", city: "Johannesburg", country: "South Africa", region: "Africa" },
  { id: "Africa/Lagos", city: "Lagos", country: "Nigeria", region: "Africa" },

  // Asia
  { id: "Asia/Kolkata", city: "Kolkata", country: "India", region: "Asia", aliases: ["IST", "India", "Mumbai", "Delhi"] },
  { id: "Asia/Karachi", city: "Karachi", country: "Pakistan", region: "Asia", aliases: ["PKT"] },
  { id: "Asia/Dhaka", city: "Dhaka", country: "Bangladesh", region: "Asia" },
  { id: "Asia/Colombo", city: "Colombo", country: "Sri Lanka", region: "Asia" },
  { id: "Asia/Kathmandu", city: "Kathmandu", country: "Nepal", region: "Asia" },
  { id: "Asia/Bangkok", city: "Bangkok", country: "Thailand", region: "Asia" },
  { id: "Asia/Singapore", city: "Singapore", country: "Singapore", region: "Asia", aliases: ["SGT"] },
  { id: "Asia/Hong_Kong", city: "Hong Kong", country: "China", region: "Asia", aliases: ["HKT"] },
  { id: "Asia/Shanghai", city: "Shanghai", country: "China", region: "Asia", aliases: ["CST China", "Beijing"] },
  { id: "Asia/Tokyo", city: "Tokyo", country: "Japan", region: "Asia", aliases: ["JST"] },
  { id: "Asia/Seoul", city: "Seoul", country: "South Korea", region: "Asia", aliases: ["KST"] },
  { id: "Asia/Jakarta", city: "Jakarta", country: "Indonesia", region: "Asia", aliases: ["WIB"] },
  { id: "Asia/Manila", city: "Manila", country: "Philippines", region: "Asia" },

  // Pacific & Oceania
  { id: "Australia/Sydney", city: "Sydney", country: "Australia", region: "Pacific", aliases: ["AEST", "AEDT"] },
  { id: "Australia/Melbourne", city: "Melbourne", country: "Australia", region: "Pacific" },
  { id: "Australia/Perth", city: "Perth", country: "Australia", region: "Pacific", aliases: ["AWST"] },
  { id: "Pacific/Auckland", city: "Auckland", country: "New Zealand", region: "Pacific", aliases: ["NZST", "NZDT"] },
  { id: "Pacific/Fiji", city: "Fiji", country: "Fiji", region: "Pacific" },
];

export const POPULAR_TIMEZONE_IDS = [
  "America/New_York",
  "Europe/London",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Asia/Singapore",
  "Australia/Sydney",
  "America/Los_Angeles",
] as const;

export const DEFAULT_DESTINATION_IDS = ["America/New_York", "Europe/London", "Asia/Tokyo"] as const;

export const QUICK_CONVERSIONS = [
  { id: "in-ny", label: "India → New York", from: "Asia/Kolkata", to: ["America/New_York"] },
  { id: "in-london", label: "India → London", from: "Asia/Kolkata", to: ["Europe/London"] },
  { id: "in-dubai", label: "India → Dubai", from: "Asia/Kolkata", to: ["Asia/Dubai"] },
  { id: "in-sg", label: "India → Singapore", from: "Asia/Kolkata", to: ["Asia/Singapore"] },
  { id: "in-tokyo", label: "India → Tokyo", from: "Asia/Kolkata", to: ["Asia/Tokyo"] },
  { id: "ny-london", label: "New York → London", from: "America/New_York", to: ["Europe/London"] },
  { id: "london-tokyo", label: "London → Tokyo", from: "Europe/London", to: ["Asia/Tokyo"] },
  { id: "london-sydney", label: "London → Sydney", from: "Europe/London", to: ["Australia/Sydney"] },
] as const;

export const MAX_DESTINATIONS = 8;

/** Common legacy / alternate IANA ids browsers may return */
const TIMEZONE_ALIASES: Record<string, string> = {
  "Asia/Calcutta": "Asia/Kolkata",
  "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "Asia/Katmandu": "Asia/Kathmandu",
  "Europe/Kiev": "Europe/Kyiv",
};

const catalogById = new Map(TIMEZONE_CATALOG.map((entry) => [entry.id, entry]));

export function canonicalizeTimeZoneId(id: string) {
  return TIMEZONE_ALIASES[id] ?? id;
}

export function getTimeZoneEntry(id: string): TimeZoneEntry | undefined {
  return catalogById.get(canonicalizeTimeZoneId(id)) ?? catalogById.get(id);
}

export function getTimeZoneLabel(id: string) {
  const entry = getTimeZoneEntry(id);
  if (entry) return `${entry.city} — ${entry.id}`;
  return id.replace(/_/g, " ");
}

export function getTimeZoneCity(id: string) {
  const entry = getTimeZoneEntry(id);
  if (entry) return entry.city;
  const canonical = canonicalizeTimeZoneId(id);
  const segment = canonical.split("/").pop();
  return segment?.replace(/_/g, " ") ?? id;
}

export function groupTimeZones(entries: TimeZoneEntry[]) {
  const groups = new Map<string, TimeZoneEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.region) ?? [];
    list.push(entry);
    groups.set(entry.region, list);
  }
  return [...groups.entries()].map(([region, items]) => ({
    region,
    items: items.sort((a, b) => a.city.localeCompare(b.city)),
  }));
}

export function getAllKnownTimeZoneIds(): string[] {
  if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
    try {
      const supported = Intl.supportedValuesOf("timeZone");
      const merged = new Set([...TIMEZONE_CATALOG.map((entry) => entry.id), ...supported]);
      return [...merged].sort((a, b) => a.localeCompare(b));
    } catch {
      /* fall through */
    }
  }
  return TIMEZONE_CATALOG.map((entry) => entry.id);
}

export function buildSearchIndex() {
  return TIMEZONE_CATALOG.map((entry) => ({
    entry,
    searchText: [
      entry.id,
      entry.city,
      entry.country,
      entry.region,
      ...(entry.aliases ?? []),
    ]
      .join(" ")
      .toLowerCase(),
  }));
}

export function filterTimeZones(query: string, limit = 40) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return groupTimeZones(TIMEZONE_CATALOG);

  const matches = TIMEZONE_CATALOG.filter((entry) => {
    const haystack = [entry.id, entry.city, entry.country, entry.region, ...(entry.aliases ?? [])]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  }).slice(0, limit);

  return groupTimeZones(matches);
}
