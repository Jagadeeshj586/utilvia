export function countCharacters(text: string) {
  return text.length;
}

export function countWords(text: string) {
  const stripped = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/[#>*_~\-|]/g, " ")
    .trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter(Boolean).length;
}

export function countLines(text: string) {
  if (!text) return 0;
  return text.split("\n").length;
}

export function markdownStats(text: string) {
  return {
    characters: countCharacters(text),
    words: countWords(text),
    lines: countLines(text),
  };
}
