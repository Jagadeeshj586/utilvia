import zxcvbn from "zxcvbn";

export type StrengthLabel = "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";

export type StrengthResult = {
  score: 0 | 1 | 2 | 3 | 4;
  label: StrengthLabel;
  crackTime: string;
};

const LABELS: StrengthLabel[] = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];

export function analyzeStrength(value: string): StrengthResult {
  if (!value) {
    return { score: 0, label: "Very Weak", crackTime: "instant" };
  }
  const result = zxcvbn(value);
  const score = Math.min(4, Math.max(0, result.score)) as 0 | 1 | 2 | 3 | 4;
  return {
    score,
    label: LABELS[score],
    crackTime: String(result.crack_times_display.offline_slow_hashing_1e4_per_second),
  };
}

export function strengthBarClass(score: number, filled: boolean): string {
  if (!filled) return "bg-[var(--hairline)]";
  switch (score) {
    case 0:
      return "bg-[#c64545]";
    case 1:
      return "bg-[#c9893a]";
    case 2:
      return "bg-[var(--accent-amber)]";
    case 3:
      return "bg-primary";
    default:
      return "bg-[var(--accent-teal)]";
  }
}

export function strengthTextClass(score: number): string {
  switch (score) {
    case 0:
      return "text-[#c64545]";
    case 1:
      return "text-[#c9893a]";
    case 2:
      return "text-[var(--accent-amber)]";
    case 3:
      return "text-primary";
    default:
      return "text-[var(--accent-teal)]";
  }
}

export function strengthDotClass(score: number): string {
  return strengthBarClass(score, true);
}
