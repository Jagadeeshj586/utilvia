export const PHASE_ORDER = ["inhale", "hold1", "exhale", "hold2"] as const;
export type PhaseId = (typeof PHASE_ORDER)[number];
export type Durations = Record<PhaseId, number>;

export const MIN_PHASE_SECONDS = 3;
export const MAX_PHASE_SECONDS = 8;

export const DEFAULT_DURATIONS: Durations = { inhale: 4, hold1: 4, exhale: 4, hold2: 4 };
export const PRESET_4_7_8: Durations = { inhale: 4, hold1: 7, exhale: 8, hold2: 4 };

export const PHASE_LABELS: Record<PhaseId, string> = {
  inhale: "Inhale",
  hold1: "Hold",
  exhale: "Exhale",
  hold2: "Hold",
};

export const PHASE_INSTRUCTIONS: Record<PhaseId, string> = {
  inhale: "Breathe in slowly through your nose",
  hold1: "Hold your breath",
  exhale: "Breathe out slowly through your mouth",
  hold2: "Hold empty",
};

export const TIMING_FIELDS: Array<{ key: PhaseId; label: string }> = [
  { key: "inhale", label: "Inhale (s)" },
  { key: "hold1", label: "Hold (s)" },
  { key: "exhale", label: "Exhale (s)" },
  { key: "hold2", label: "Hold (s)" },
];

export const BOX_BREATHING_FAQS = [
  {
    question: "What is box breathing?",
    answer:
      "Box breathing is a 4-part pattern: inhale, hold, exhale, hold — usually 4 seconds each. Following the square helps you keep an even rhythm.",
  },
  {
    question: "How many rounds should I do?",
    answer:
      "Four to six rounds (about 1–2 minutes) is a common start. Stop if you feel lightheaded and return to normal breathing.",
  },
  {
    question: "What's the difference between box breathing and 4-7-8?",
    answer:
      "Box breathing uses equal sides (4-4-4-4). 4-7-8 uses a longer hold and exhale: inhale 4, hold 7, exhale 8. Use the 4-7-8 preset to switch.",
  },
  {
    question: "Can box breathing help with anxiety?",
    answer:
      "A slow, even pattern can calm the nervous system for many people. This timer is a practice aid, not medical advice.",
  },
  {
    question: "Is this timer free?",
    answer: "Yes. It runs in your browser with no signup. Timing stays on your device.",
  },
] as const;
