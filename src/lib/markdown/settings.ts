export type MarkdownSettings = {
  fontSize: "small" | "medium" | "large";
  wordWrap: boolean;
  htmlFormat: "minified" | "formatted";
  downloadMode: "fragment" | "document";
};

const STORAGE_KEY = "toolhub-markdown-settings";

export const DEFAULT_MARKDOWN_SETTINGS: MarkdownSettings = {
  fontSize: "medium",
  wordWrap: true,
  htmlFormat: "formatted",
  downloadMode: "document",
};

export function loadMarkdownSettings(): MarkdownSettings {
  if (typeof window === "undefined") return DEFAULT_MARKDOWN_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MARKDOWN_SETTINGS;
    return { ...DEFAULT_MARKDOWN_SETTINGS, ...(JSON.parse(raw) as Partial<MarkdownSettings>) };
  } catch {
    return DEFAULT_MARKDOWN_SETTINGS;
  }
}

export function saveMarkdownSettings(settings: MarkdownSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export const FONT_SIZE_CLASS: Record<MarkdownSettings["fontSize"], string> = {
  small: "text-xs leading-relaxed",
  medium: "text-sm leading-relaxed",
  large: "text-base leading-relaxed",
};
