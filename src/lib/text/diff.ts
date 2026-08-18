export type DiffLineType = "same" | "add" | "remove";

export type DiffLine = {
  type: DiffLineType;
  text: string;
};

export type SplitDiffCell = {
  lineNumber: number | null;
  text: string;
  type: "same" | "add" | "remove" | "empty";
};

export type SplitDiffRow = {
  left: SplitDiffCell;
  right: SplitDiffCell;
};

export type TextDiffResult = {
  lines: DiffLine[];
  splitRows: SplitDiffRow[];
  stats: {
    added: number;
    removed: number;
    unchanged: number;
  };
};

export const DEFAULT_ORIGINAL_TEXT = `Hello World
Line two
Line three`;

export const DEFAULT_MODIFIED_TEXT = `Hello World
Line 2 changed
Line three
Line four`;

export function diffLines(original: string, modified: string): DiffLine[] {
  const left = original.split("\n");
  const right = modified.split("\n");
  const m = left.length;
  const n = right.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      dp[i][j] =
        left[i - 1] === right[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const out: DiffLine[] = [];
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    if (left[i - 1] === right[j - 1]) {
      out.push({ type: "same", text: left[i - 1] });
      i -= 1;
      j -= 1;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      out.push({ type: "remove", text: left[i - 1] });
      i -= 1;
    } else {
      out.push({ type: "add", text: right[j - 1] });
      j -= 1;
    }
  }

  while (i > 0) {
    out.push({ type: "remove", text: left[i - 1] });
    i -= 1;
  }

  while (j > 0) {
    out.push({ type: "add", text: right[j - 1] });
    j -= 1;
  }

  return out.reverse();
}

export function buildSplitRows(lines: DiffLine[]): SplitDiffRow[] {
  let leftLine = 0;
  let rightLine = 0;

  return lines.map((line) => {
    if (line.type === "same") {
      leftLine += 1;
      rightLine += 1;
      return {
        left: { lineNumber: leftLine, text: line.text, type: "same" as const },
        right: { lineNumber: rightLine, text: line.text, type: "same" as const },
      };
    }

    if (line.type === "remove") {
      leftLine += 1;
      return {
        left: { lineNumber: leftLine, text: line.text, type: "remove" as const },
        right: { lineNumber: null, text: "", type: "empty" as const },
      };
    }

    rightLine += 1;
    return {
      left: { lineNumber: null, text: "", type: "empty" as const },
      right: { lineNumber: rightLine, text: line.text, type: "add" as const },
    };
  });
}

export function compareTexts(original: string, modified: string): TextDiffResult {
  const lines = diffLines(original, modified);
  const stats = {
    added: lines.filter((line) => line.type === "add").length,
    removed: lines.filter((line) => line.type === "remove").length,
    unchanged: lines.filter((line) => line.type === "same").length,
  };

  return {
    lines,
    splitRows: buildSplitRows(lines),
    stats,
  };
}

export const TEXT_DIFF_FAQS = [
  {
    question: "How to compare two texts online?",
    answer:
      "Paste your original text on the left and modified text on the right. Differences appear automatically as you type, or click Compare Texts for instant results.",
  },
  {
    question: "What is split vs unified view?",
    answer:
      "Split view shows original and modified text side by side with aligned rows. Unified view shows a single Git-style diff with + and − prefixes.",
  },
  {
    question: "Does it compare line by line?",
    answer: "Yes. The diff compares texts line by line and highlights added, removed, and unchanged lines.",
  },
  {
    question: "Is my text sent to a server?",
    answer: "No. Comparison runs entirely in your browser. Your text never leaves your device.",
  },
  {
    question: "Is text diff checker free?",
    answer: "Yes. This tool is free to use with no signup required.",
  },
] as const;
