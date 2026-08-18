export type RandomMode = "single" | "list" | "uuid" | "dice";

export const DICE_SIDES = [4, 6, 8, 10, 12, 20] as const;
export type DiceSides = (typeof DICE_SIDES)[number];

export const MAX_LIST_COUNT = 1000;
export const MAX_DICE_COUNT = 10;

export type RandomRangeInput = {
  min: number;
  max: number;
};

export type RandomListInput = RandomRangeInput & {
  count: number;
  unique: boolean;
};

export type RandomDiceInput = {
  sides: DiceSides;
  count: number;
};

export function normalizeRange(min: number, max: number) {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return { min: low, max: high };
}

export function randomIntInRange(min: number, max: number): number {
  const { min: low, max: high } = normalizeRange(min, max);
  const span = high - low + 1;
  return low + Math.floor(Math.random() * span);
}

export function generateSingleNumber(input: RandomRangeInput): { value: number; error: string | null } {
  const min = Math.trunc(input.min);
  const max = Math.trunc(input.max);
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { value: 0, error: "Enter valid min and max values." };
  }
  return { value: randomIntInRange(min, max), error: null };
}

export function generateNumberList(input: RandomListInput): { values: number[]; error: string | null } {
  const min = Math.trunc(input.min);
  const max = Math.trunc(input.max);
  const count = Math.trunc(input.count);

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { values: [], error: "Enter valid min and max values." };
  }
  if (!Number.isFinite(count) || count < 1) {
    return { values: [], error: "Count must be at least 1." };
  }
  if (count > MAX_LIST_COUNT) {
    return { values: [], error: `Count cannot exceed ${MAX_LIST_COUNT}.` };
  }

  const { min: low, max: high } = normalizeRange(min, max);
  const span = high - low + 1;

  if (input.unique && count > span) {
    return { values: [], error: "Cannot generate more unique numbers than exist in the range." };
  }

  if (input.unique) {
    const pool = Array.from({ length: span }, (_, index) => low + index);
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return { values: pool.slice(0, count), error: null };
  }

  const values = Array.from({ length: count }, () => randomIntInRange(low, high));
  return { values, error: null };
}

export function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const rand = Math.floor(Math.random() * 16);
    const value = char === "x" ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function rollDice(input: RandomDiceInput): { values: number[]; total: number; error: string | null } {
  const count = Math.trunc(input.count);
  if (!Number.isFinite(count) || count < 1) {
    return { values: [], total: 0, error: "Number of dice must be at least 1." };
  }
  if (count > MAX_DICE_COUNT) {
    return { values: [], total: 0, error: `Number of dice cannot exceed ${MAX_DICE_COUNT}.` };
  }

  const values = Array.from({ length: count }, () => randomIntInRange(1, input.sides));
  return { values, total: values.reduce((sum, value) => sum + value, 0), error: null };
}

export function formatListOutput(values: number[]) {
  return values.join("\n");
}

export function formatListCsv(values: number[]) {
  return values.join(", ");
}

export const RANDOM_NUMBER_FAQS = [
  {
    question: "How to generate random numbers online?",
    answer: "Choose Single mode, enter a min and max, then click Generate to get one random integer in that range.",
  },
  {
    question: "How to generate a list of random numbers?",
    answer: "Switch to List mode, set min, max, and count. Enable No duplicates if each number should appear only once, then click Generate List.",
  },
  {
    question: "How to roll dice online?",
    answer: "Open Dice mode, pick a die type (d4 through d20), set how many dice to roll, then click Roll Dice.",
  },
  {
    question: "How to generate a UUID?",
    answer: "Switch to UUID mode and click Generate UUID to create a version 4 identifier in your browser.",
  },
  {
    question: "Are random numbers truly random?",
    answer: "Results use your browser's random source (Math.random or crypto APIs). They are fine for games, demos, and classroom picks, but not for cryptographic security.",
  },
] as const;
