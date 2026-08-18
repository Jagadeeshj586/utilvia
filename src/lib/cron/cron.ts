export type CronFieldId = "second" | "minute" | "hour" | "dayOfMonth" | "month" | "dayOfWeek";
export type FieldMode = "every" | "interval" | "specific" | "range";

export type FieldConfig = {
  mode: FieldMode;
  step: number;
  values: number[];
  from: number;
  to: number;
  rangeStep: number;
};

export type FieldSpec = {
  id: CronFieldId;
  label: string;
  unit: string;
  min: number;
  max: number;
  names?: Record<string, number>;
  labels?: string[];
};

export type CronConfig = {
  includeSeconds: boolean;
  second: FieldConfig;
  minute: FieldConfig;
  hour: FieldConfig;
  dayOfMonth: FieldConfig;
  month: FieldConfig;
  dayOfWeek: FieldConfig;
};

export type CronParseResult =
  | { ok: true; config: CronConfig; expression: string }
  | { ok: false; error: string };

export type CronBuildResult =
  | { ok: true; expression: string; config: CronConfig }
  | { ok: false; error: string };

const MONTH_NAMES: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

const DOW_NAMES: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

export const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const DOW_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const FIELD_SPECS: Record<CronFieldId, FieldSpec> = {
  second: { id: "second", label: "Seconds", unit: "second", min: 0, max: 59 },
  minute: { id: "minute", label: "Minutes", unit: "minute", min: 0, max: 59 },
  hour: { id: "hour", label: "Hours", unit: "hour", min: 0, max: 23 },
  dayOfMonth: { id: "dayOfMonth", label: "Day of month", unit: "day", min: 1, max: 31 },
  month: {
    id: "month",
    label: "Month",
    unit: "month",
    min: 1,
    max: 12,
    names: MONTH_NAMES,
    labels: MONTH_LABELS,
  },
  dayOfWeek: {
    id: "dayOfWeek",
    label: "Day of week",
    unit: "weekday",
    min: 0,
    max: 6,
    names: DOW_NAMES,
    labels: DOW_LABELS,
  },
};

export const FIELD_ORDER_5: CronFieldId[] = ["minute", "hour", "dayOfMonth", "month", "dayOfWeek"];
export const FIELD_ORDER_6: CronFieldId[] = ["second", ...FIELD_ORDER_5];

export function defaultField(spec: FieldSpec, mode: FieldMode = "every"): FieldConfig {
  return {
    mode,
    step: 5,
    values: mode === "specific" ? [spec.min] : [],
    from: spec.min,
    to: spec.max,
    rangeStep: 1,
  };
}

export function defaultConfig(): CronConfig {
  return {
    includeSeconds: false,
    second: defaultField(FIELD_SPECS.second, "specific"),
    minute: { ...defaultField(FIELD_SPECS.minute, "specific"), values: [0] },
    hour: { ...defaultField(FIELD_SPECS.hour, "specific"), values: [9] },
    dayOfMonth: defaultField(FIELD_SPECS.dayOfMonth),
    month: defaultField(FIELD_SPECS.month),
    dayOfWeek: defaultField(FIELD_SPECS.dayOfWeek),
  };
}

export const CRON_PRESETS = [
  { id: "every-minute", label: "Every minute", expression: "* * * * *" },
  { id: "every-5", label: "Every 5 minutes", expression: "*/5 * * * *" },
  { id: "every-15", label: "Every 15 minutes", expression: "*/15 * * * *" },
  { id: "every-hour", label: "Every hour", expression: "0 * * * *" },
  { id: "midnight", label: "Every day at midnight", expression: "0 0 * * *" },
  { id: "nine", label: "Every day at 9:00", expression: "0 9 * * *" },
  { id: "weekdays", label: "Weekdays at 9:00", expression: "0 9 * * 1-5" },
  { id: "weekends", label: "Weekends at 10:00", expression: "0 10 * * 0,6" },
  { id: "monday", label: "Mondays at 8:00", expression: "0 8 * * 1" },
  { id: "monthly", label: "First of the month", expression: "0 0 1 * *" },
  { id: "every-30s", label: "Every 30 seconds", expression: "*/30 * * * * *" },
] as const;

export const CRON_FAQS = [
  {
    question: "What is a cron expression?",
    answer:
      "A cron expression is a compact schedule used by cron, CI systems, and many apps. The standard 5-field form is minute, hour, day of month, month, and day of week.",
  },
  {
    question: "When should I use the 6-field format?",
    answer:
      "Use 6 fields when the scheduler supports seconds (Quartz, some cloud jobs). The extra field comes first: second minute hour day-of-month month day-of-week.",
  },
  {
    question: "What happens if day of month and day of week are both set?",
    answer:
      "In standard cron, the job runs when either field matches — it is an OR, not an AND. Leave one as every (*) unless you want that behavior.",
  },
  {
    question: "Are names like MON and JAN supported?",
    answer:
      "Yes when pasting. Months JAN–DEC and weekdays SUN–SAT are parsed. Generated expressions use numbers so they work in more cron implementations.",
  },
  {
    question: "Is this the same as Linux crontab?",
    answer:
      "The 5-field syntax matches typical Vixie/crontab expressions. Quartz features such as L, W, and # are not generated.",
  },
] as const;

function fieldFromConfig(config: CronConfig, id: CronFieldId): FieldConfig {
  return config[id];
}

function normalizeDow(value: number) {
  return value === 7 ? 0 : value;
}

function parseNumberToken(token: string, spec: FieldSpec): number | null {
  const upper = token.toUpperCase();
  if (spec.names && upper in spec.names) return spec.names[upper];
  if (!/^\d+$/.test(token)) return null;
  const value = Number(token);
  if (spec.id === "dayOfWeek" && value === 7) return 0;
  if (!Number.isInteger(value) || value < spec.min || value > spec.max) return null;
  return value;
}

function uniqueSorted(values: number[]) {
  return [...new Set(values)].sort((a, b) => a - b);
}

export function validateField(spec: FieldSpec, field: FieldConfig): string | null {
  if (field.mode === "interval") {
    if (!Number.isInteger(field.step) || field.step < 1 || field.step > spec.max) {
      return `${spec.label}: interval must be between 1 and ${spec.max}.`;
    }
  }
  if (field.mode === "specific") {
    if (field.values.length === 0) return `${spec.label}: select at least one value.`;
    if (field.values.some((value) => value < spec.min || value > spec.max)) {
      return `${spec.label}: values must be between ${spec.min} and ${spec.max}.`;
    }
  }
  if (field.mode === "range") {
    if (field.from < spec.min || field.to > spec.max || field.from > field.to) {
      return `${spec.label}: range must run from ${spec.min} to ${spec.max}, with from ≤ to.`;
    }
    if (!Number.isInteger(field.rangeStep) || field.rangeStep < 1) {
      return `${spec.label}: range step must be 1 or more.`;
    }
  }
  return null;
}

export function buildField(spec: FieldSpec, field: FieldConfig): string {
  if (field.mode === "every") return "*";
  if (field.mode === "interval") return field.step <= 1 ? "*" : `*/${field.step}`;
  if (field.mode === "specific") return uniqueSorted(field.values).join(",");
  if (field.rangeStep > 1) return `${field.from}-${field.to}/${field.rangeStep}`;
  if (field.from === spec.min && field.to === spec.max) return "*";
  return `${field.from}-${field.to}`;
}

export function parseField(token: string, spec: FieldSpec): FieldConfig | { error: string } {
  const raw = token.trim().toUpperCase();
  if (!raw) return { error: `${spec.label} is empty.` };
  if (raw === "*" || raw === "?") return defaultField(spec, "every");
  if (raw === "L" || raw === "LW" || raw.includes("#") || /^\d+W$/.test(raw) || /^\d+L$/.test(raw)) {
    return { error: `${spec.label}: Quartz tokens such as L, W, and # are not supported.` };
  }

  if (/^\*\/\d+$/.test(raw)) {
    const step = Number(raw.slice(2));
    if (step < 1) return { error: `${spec.label}: interval must be at least 1.` };
    return { ...defaultField(spec, "interval"), step };
  }

  const parts = raw.split(",");
  const values: number[] = [];
  let onlyRange: { from: number; to: number; rangeStep: number } | null = null;

  for (const part of parts) {
    const stepMatch = part.match(/^([A-Z]+|\d+)-([A-Z]+|\d+)(?:\/(\d+))?$/);
    if (stepMatch) {
      const from = parseNumberToken(stepMatch[1], spec);
      const to = parseNumberToken(stepMatch[2], spec);
      const rangeStep = stepMatch[3] ? Number(stepMatch[3]) : 1;
      if (from == null || to == null || from > to || rangeStep < 1) {
        return { error: `${spec.label}: invalid range “${part}”.` };
      }
      if (parts.length === 1 && (from !== spec.min || to !== spec.max || rangeStep === 1 || rangeStep > 1)) {
        onlyRange = { from, to, rangeStep };
      }
      for (let value = from; value <= to; value += rangeStep) {
        values.push(spec.id === "dayOfWeek" ? normalizeDow(value) : value);
      }
      continue;
    }
    const value = parseNumberToken(part, spec);
    if (value == null) return { error: `${spec.label}: invalid value “${part}”.` };
    values.push(value);
  }

  if (parts.length === 1 && onlyRange) {
    if (onlyRange.from === spec.min && onlyRange.to === spec.max && onlyRange.rangeStep > 1) {
      return { ...defaultField(spec, "interval"), step: onlyRange.rangeStep };
    }
    if (onlyRange.rangeStep === 1 && onlyRange.from === spec.min && onlyRange.to === spec.max) {
      return defaultField(spec, "every");
    }
    return {
      ...defaultField(spec, "range"),
      from: onlyRange.from,
      to: onlyRange.to,
      rangeStep: onlyRange.rangeStep,
    };
  }

  return { ...defaultField(spec, "specific"), values: uniqueSorted(values) };
}

export function buildExpression(config: CronConfig): CronBuildResult {
  const ids = config.includeSeconds ? FIELD_ORDER_6 : FIELD_ORDER_5;
  for (const id of ids) {
    const error = validateField(FIELD_SPECS[id], fieldFromConfig(config, id));
    if (error) return { ok: false, error };
  }
  const expression = ids.map((id) => buildField(FIELD_SPECS[id], fieldFromConfig(config, id))).join(" ");
  return { ok: true, expression, config };
}

export function parseExpression(input: string): CronParseResult {
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (!trimmed) return { ok: false, error: "Enter a cron expression." };
  const parts = trimmed.split(" ");
  if (parts.length === 7) {
    return { ok: false, error: "7-field expressions with a year are not supported. Use 5 or 6 fields." };
  }
  if (parts.length !== 5 && parts.length !== 6) {
    return { ok: false, error: "Use 5 fields (standard) or 6 fields (with seconds)." };
  }

  const includeSeconds = parts.length === 6;
  const ids = includeSeconds ? FIELD_ORDER_6 : FIELD_ORDER_5;
  const config = defaultConfig();
  config.includeSeconds = includeSeconds;
  if (!includeSeconds) config.second = defaultField(FIELD_SPECS.second, "specific");

  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index];
    const parsed = parseField(parts[index], FIELD_SPECS[id]);
    if ("error" in parsed) return { ok: false, error: parsed.error };
    config[id] = parsed;
  }

  const built = buildExpression(config);
  if (!built.ok) return built;
  return { ok: true, config, expression: built.expression };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function listWords(items: string[]) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function namedValue(spec: FieldSpec, value: number) {
  if (spec.labels) {
    const index = spec.id === "month" ? value - 1 : value;
    return spec.labels[index] ?? String(value);
  }
  return String(value);
}

export function describeField(spec: FieldSpec, field: FieldConfig): string {
  if (field.mode === "every") return `every ${spec.unit}`;
  if (field.mode === "interval") return field.step <= 1 ? `every ${spec.unit}` : `every ${field.step} ${spec.unit}s`;
  if (field.mode === "specific") return listWords(uniqueSorted(field.values).map((value) => namedValue(spec, value)));
  const step = field.rangeStep > 1 ? ` in steps of ${field.rangeStep}` : "";
  return `${namedValue(spec, field.from)}–${namedValue(spec, field.to)}${step}`;
}

function isEvery(field: FieldConfig) {
  return field.mode === "every" || (field.mode === "interval" && field.step <= 1);
}

function singleValue(field: FieldConfig): number | null {
  if (field.mode === "specific" && field.values.length === 1) return field.values[0];
  return null;
}

export function describeCron(config: CronConfig): string {
  const second = config.includeSeconds ? config.second : { ...defaultField(FIELD_SPECS.second, "specific"), values: [0] };
  const { minute, hour, dayOfMonth, month, dayOfWeek } = config;

  let time = "";
  const hourValue = singleValue(hour);
  const minuteValue = singleValue(minute);
  const secondValue = singleValue(second);

  if (config.includeSeconds && isEvery(second) && isEvery(minute) && isEvery(hour)) {
    time = "Every second";
  } else if (config.includeSeconds && second.mode === "interval" && isEvery(minute) && isEvery(hour)) {
    time = `Every ${second.step} seconds`;
  } else if (!config.includeSeconds && isEvery(minute) && isEvery(hour)) {
    time = "Every minute";
  } else if (minute.mode === "interval" && isEvery(hour) && (!config.includeSeconds || isEvery(second) || secondValue === 0)) {
    time = `Every ${minute.step} minutes`;
  } else if (hour.mode === "interval" && minuteValue === 0 && (!config.includeSeconds || secondValue === 0)) {
    time = `Every ${hour.step} hours`;
  } else if (hourValue != null && minuteValue != null && (!config.includeSeconds || secondValue != null)) {
    time = config.includeSeconds
      ? `At ${pad(hourValue)}:${pad(minuteValue)}:${pad(secondValue ?? 0)}`
      : `At ${pad(hourValue)}:${pad(minuteValue)}`;
  } else if (minuteValue === 0 && isEvery(hour) && (!config.includeSeconds || secondValue === 0 || isEvery(second))) {
    time = "Every hour";
  } else {
    const bits = [
      config.includeSeconds ? `second ${describeField(FIELD_SPECS.second, second)}` : null,
      `minute ${describeField(FIELD_SPECS.minute, minute)}`,
      `hour ${describeField(FIELD_SPECS.hour, hour)}`,
    ].filter(Boolean);
    time = `At ${bits.join(", ")}`;
  }

  const monthText = isEvery(month) ? "every month" : `in ${describeField(FIELD_SPECS.month, month)}`;
  const bothDaysRestricted = !isEvery(dayOfMonth) && !isEvery(dayOfWeek);
  let dayText = "every day";
  if (isEvery(dayOfMonth) && isEvery(dayOfWeek)) {
    dayText = "every day";
  } else if (isEvery(dayOfMonth) && dayOfWeek.mode === "range" && dayOfWeek.from === 1 && dayOfWeek.to === 5 && dayOfWeek.rangeStep === 1) {
    dayText = "on weekdays";
  } else if (
    isEvery(dayOfMonth) &&
    dayOfWeek.mode === "specific" &&
    uniqueSorted(dayOfWeek.values).join(",") === "0,6"
  ) {
    dayText = "on weekends";
  } else if (isEvery(dayOfMonth)) {
    dayText = `on ${describeField(FIELD_SPECS.dayOfWeek, dayOfWeek)}`;
  } else if (isEvery(dayOfWeek)) {
    dayText = `on day ${describeField(FIELD_SPECS.dayOfMonth, dayOfMonth)} of the month`;
  } else {
    dayText = `on day ${describeField(FIELD_SPECS.dayOfMonth, dayOfMonth)} of the month or on ${describeField(FIELD_SPECS.dayOfWeek, dayOfWeek)}`;
  }

  const orNote = bothDaysRestricted ? " (day-of-month or day-of-week matches)." : ".";
  return `${time}, ${dayText}, ${monthText}${orNote}`;
}

export function fieldBreakdown(config: CronConfig): Array<{ id: CronFieldId; label: string; token: string; description: string }> {
  const ids = config.includeSeconds ? FIELD_ORDER_6 : FIELD_ORDER_5;
  return ids.map((id) => {
    const spec = FIELD_SPECS[id];
    const field = fieldFromConfig(config, id);
    return {
      id,
      label: spec.label,
      token: buildField(spec, field),
      description: describeField(spec, field),
    };
  });
}
