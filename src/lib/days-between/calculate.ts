/** Calendar-date helpers for days-between calculations (local timezone, date-only). */

export type DaysBetweenResult = {
  totalDays: number;
  years: number;
  months: number;
  days: number;
  start: string;
  end: string;
  swapped: boolean;
};

export type RelativeToToday = {
  kind: "start-today" | "end-today" | "both-today" | "countdown" | "ago" | "between";
  daysFromTodayToEnd: number;
  daysFromStartToToday: number;
  label: string;
};

export const DAYS_BETWEEN_FAQS = [
  {
    question: "Does the calculator count the start date as day 1?",
    answer:
      "No. The day count is end date minus start date. The start date is not counted as a full elapsed day — so Jan 1 to Jan 3 is 2 days, not 3.",
  },
  {
    question: "Can I calculate days between a past date and today?",
    answer:
      "Yes. Pick any past or future start and end dates. The tool also shows how the range relates to today for countdowns and elapsed time.",
  },
  {
    question: "Does this account for leap years automatically?",
    answer:
      "Yes. Calculations use real calendar dates, so February 29 and other leap-year days are handled correctly.",
  },
  {
    question: "Can I use this to calculate exact contract or lease duration?",
    answer:
      "Yes. Use the total day count for day-based terms, and the years / months / days breakdown for calendar-style durations.",
  },
  {
    question: "Is days between dates calculator free?",
    answer: "Yes. The Utilvia Days Between Dates calculator is free with no signup. All calculations run in your browser.",
  },
] as const;

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

export function daysBetweenCalendarDates(start: Date, end: Date): number {
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((utcEnd - utcStart) / 86_400_000);
}

/** Calendar years / months / days from earlier → later date (exclusive of start day). */
export function calendarBreakdown(earlier: Date, later: Date): { years: number; months: number; days: number } {
  let years = later.getFullYear() - earlier.getFullYear();
  let months = later.getMonth() - earlier.getMonth();
  let days = later.getDate() - earlier.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(later.getFullYear(), later.getMonth(), 0);
    days += previousMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

export function calculateDaysBetween(startValue: string, endValue: string): DaysBetweenResult | null {
  const startDate = parseDateInput(startValue);
  const endDate = parseDateInput(endValue);
  if (!startDate || !endDate) return null;

  const signedDays = daysBetweenCalendarDates(startDate, endDate);
  const swapped = signedDays < 0;
  const earlier = swapped ? endDate : startDate;
  const later = swapped ? startDate : endDate;
  const breakdown = calendarBreakdown(earlier, later);

  return {
    totalDays: Math.abs(signedDays),
    years: breakdown.years,
    months: breakdown.months,
    days: breakdown.days,
    start: startValue,
    end: endValue,
    swapped,
  };
}

export function relativeToToday(startValue: string, endValue: string, today = new Date()): RelativeToToday | null {
  const startDate = parseDateInput(startValue);
  const endDate = parseDateInput(endValue);
  if (!startDate || !endDate) return null;

  const todayValue = toDateInputValue(today);
  const todayDate = parseDateInput(todayValue)!;
  const daysFromTodayToEnd = daysBetweenCalendarDates(todayDate, endDate);
  const daysFromStartToToday = daysBetweenCalendarDates(startDate, todayDate);

  if (startValue === todayValue && endValue === todayValue) {
    return {
      kind: "both-today",
      daysFromTodayToEnd,
      daysFromStartToToday,
      label: "Start and end are both today",
    };
  }

  if (endValue === todayValue) {
    return {
      kind: "end-today",
      daysFromTodayToEnd,
      daysFromStartToToday,
      label: "End date is today",
    };
  }

  if (startValue === todayValue) {
    return {
      kind: "start-today",
      daysFromTodayToEnd,
      daysFromStartToToday,
      label:
        daysFromTodayToEnd === 0
          ? "Start date is today"
          : daysFromTodayToEnd > 0
            ? `Start is today · ${daysFromTodayToEnd} day${daysFromTodayToEnd === 1 ? "" : "s"} until end`
            : `Start is today · end was ${Math.abs(daysFromTodayToEnd)} day${Math.abs(daysFromTodayToEnd) === 1 ? "" : "s"} ago`,
    };
  }

  if (daysFromTodayToEnd > 0) {
    return {
      kind: "countdown",
      daysFromTodayToEnd,
      daysFromStartToToday,
      label: `${daysFromTodayToEnd} day${daysFromTodayToEnd === 1 ? "" : "s"} from today until the end date`,
    };
  }

  if (daysFromTodayToEnd < 0) {
    return {
      kind: "ago",
      daysFromTodayToEnd,
      daysFromStartToToday,
      label: `End date was ${Math.abs(daysFromTodayToEnd)} day${Math.abs(daysFromTodayToEnd) === 1 ? "" : "s"} ago`,
    };
  }

  return {
    kind: "between",
    daysFromTodayToEnd,
    daysFromStartToToday,
    label: "End date is today",
  };
}

export function defaultDatePair(today = new Date()): { start: string; end: string } {
  const start = toDateInputValue(today);
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 197);
  return { start, end: toDateInputValue(endDate) };
}
