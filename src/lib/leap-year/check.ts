export type LeapYearReason =
  | "divisible-by-400"
  | "century-not-400"
  | "divisible-by-4"
  | "not-divisible-by-4";

export type LeapYearResult = {
  year: number;
  isLeap: boolean;
  reason: LeapYearReason;
  explanation: string;
  headline: string;
  previousLeapYear: number;
  nextLeapYear: number;
};

export const LEAP_YEAR_FAQS = [
  {
    question: "What is the leap year rule?",
    answer:
      "A year is a leap year if it is divisible by 4. Century years (divisible by 100) are not leap years unless they are also divisible by 400. So 2000 was a leap year, but 1900 was not.",
  },
  {
    question: "Why was 1900 not a leap year but 2000 was?",
    answer:
      "Both are century years. 1900 is divisible by 100 but not by 400, so it is skipped. 2000 is divisible by 400, so it remains a leap year.",
  },
  {
    question: "Why do we need leap years at all?",
    answer:
      "Earth's orbit around the Sun takes about 365.2425 days. Adding February 29 roughly every four years keeps the calendar aligned with the seasons.",
  },
  {
    question: "How often do leap years occur?",
    answer:
      "Usually every 4 years, with century-year exceptions. Over a long span, leap years average about 97 times every 400 years.",
  },
  {
    question: "Is leap year checker free?",
    answer: "Yes. The Utilvia Leap Year Checker is free with no signup. All checks run in your browser.",
  },
] as const;

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function leapYearReason(year: number): LeapYearReason {
  if (year % 400 === 0) return "divisible-by-400";
  if (year % 100 === 0) return "century-not-400";
  if (year % 4 === 0) return "divisible-by-4";
  return "not-divisible-by-4";
}

export function leapYearExplanation(year: number): string {
  switch (leapYearReason(year)) {
    case "divisible-by-400":
      return `${year} is a leap year — divisible by 400.`;
    case "century-not-400":
      return `${year} is NOT a leap year — century year not divisible by 400.`;
    case "divisible-by-4":
      return `${year} is a leap year — divisible by 4.`;
    case "not-divisible-by-4":
      return `${year} is NOT a leap year — not divisible by 4.`;
  }
}

export function findPreviousLeapYear(year: number): number {
  let candidate = year - 1;
  while (!isLeapYear(candidate)) candidate -= 1;
  return candidate;
}

export function findNextLeapYear(year: number): number {
  let candidate = year + 1;
  while (!isLeapYear(candidate)) candidate += 1;
  return candidate;
}

export function parseYearInput(value: string): number | null {
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  const year = Number(trimmed);
  if (!Number.isSafeInteger(year)) return null;
  return year;
}

export function checkLeapYear(year: number): LeapYearResult {
  const isLeap = isLeapYear(year);
  return {
    year,
    isLeap,
    reason: leapYearReason(year),
    explanation: leapYearExplanation(year),
    headline: isLeap ? "Leap Year" : "Not a Leap Year",
    previousLeapYear: findPreviousLeapYear(year),
    nextLeapYear: findNextLeapYear(year),
  };
}
