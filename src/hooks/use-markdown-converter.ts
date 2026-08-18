"use client";

import { useEffect, useMemo, useState } from "react";
import { convertMarkdown, DEFAULT_MARKDOWN } from "@/lib/markdown/convert";
import { htmlToPreviewText } from "@/lib/markdown/html";
import { markdownStats } from "@/lib/markdown/statistics";

const DEBOUNCE_MS = 150;

export function useMarkdownConverter(initial = DEFAULT_MARKDOWN) {
  const [markdown, setMarkdown] = useState(initial);
  const [debouncedMarkdown, setDebouncedMarkdown] = useState(initial);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedMarkdown(markdown), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [markdown]);

  const { html, error } = useMemo(() => convertMarkdown(debouncedMarkdown, true), [debouncedMarkdown]);
  const previewHtml = html;
  const previewText = useMemo(() => htmlToPreviewText(previewHtml), [previewHtml]);
  const stats = useMemo(() => markdownStats(markdown), [markdown]);

  return {
    markdown,
    setMarkdown,
    html,
    previewHtml,
    previewText,
    stats,
    error,
  };
}
