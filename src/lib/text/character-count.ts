export type CharacterCountStats = {
  characters: number;
  noSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
};

const ABBREV = /\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|e\.g|i\.e|U\.S|U\.K)\./gi;

export function countSentences(text: string) {
  if (!text.trim()) return 0;
  const normalized = text.replace(/\.{3,}/g, "…").replace(ABBREV, (match) => match.replace(".", "\0"));
  return normalized
    .split(/[.!?]+/)
    .map((part) => part.replace(/\u0000/g, ".").trim())
    .filter(Boolean).length;
}

export function countParagraphs(text: string) {
  if (!text.trim()) return 0;
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

export function countCharacters(text: string): CharacterCountStats {
  const characters = text.length;
  const noSpaces = text.replace(/\s/g, "").length;
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;

  return {
    characters,
    noSpaces,
    words,
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
  };
}

export const CHARACTER_COUNTER_FAQS = [
  {
    question: "How do I count characters online?",
    answer:
      "Paste or type your text. Character, word, sentence, and paragraph counts update instantly.",
  },
  {
    question: "Does it count spaces?",
    answer: "Yes. We show both total characters and characters without spaces.",
  },
  {
    question: "Is character counter free?",
    answer: "Yes. This tool is free to use with no signup required.",
  },
  {
    question: "Is my text private?",
    answer: "Yes. Counting runs entirely in your browser. Your text never leaves your device.",
  },
  {
    question: "What's the difference from Word Counter?",
    answer:
      "Character Counter focuses on characters, words, sentences, and paragraphs. Word Counter adds reading time, speaking time, keywords, and platform limits.",
  },
] as const;
