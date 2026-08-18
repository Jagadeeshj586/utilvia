import "server-only";
import { buildDefaultFaqs, buildToolAbout } from "@/lib/tools/tool-content";
import type { ToolAbout } from "@/lib/tools/tool-content";
import {
  CATEGORIES,
  getAllTools as getCatalogTools,
  getCategory,
  categoryHref,
  toolHref,
  toolId,
  searchTools as searchCatalogTools,
  type CategoryId,
  type ToolBadge,
  type ToolStatus,
  type ToolIconName,
  type ToolFaq,
  type RelatedToolRef,
  type ToolDefinition as CatalogTool,
} from "@/lib/tools/catalog";

export {
  CATEGORIES as CATEGORIES,
  getCategory as getCategory,
  categoryHref as categoryHref,
  toolHref as toolHref,
  toolId as toolId,
  type CategoryId as CategoryId,
  type ToolBadge,
  type ToolStatus,
  type ToolIconName,
  type ToolFaq,
  type RelatedToolRef,
};

export type { ToolAbout };

export type ToolDefinition = CatalogTool & {
  about: ToolAbout;
  faqs: ToolFaq[];
};

function hydrate(tool: CatalogTool): ToolDefinition {
  const contentInput = {
    slug: tool.slug,
    name: tool.name,
    short: tool.shortDescription,
    category: tool.category,
    longDescription: tool.longDescription,
    fileUpload: tool.fileUpload,
    privacy: tool.privacy === "mixed" ? "mixed" : "local",
  } as const;
  return {
    ...tool,
    about: buildToolAbout(contentInput),
    faqs: buildDefaultFaqs(contentInput),
  };
}

const TOOLS: ToolDefinition[] = getCatalogTools().map(hydrate);

export function getAllTools() {
  return TOOLS;
}

export function getReadyTools() {
  return TOOLS.filter((item) => item.status === "ready");
}

export function getPopularTools() {
  return TOOLS.filter((item) => item.badge === "popular");
}

export function getNewTools() {
  return TOOLS.filter((item) => item.badge === "new");
}

export function getToolsByCategory(category: string) {
  return TOOLS.filter((item) => item.category === category);
}

export function getTool(category: string, slug: string) {
  return TOOLS.find((item) => item.category === category && item.slug === slug);
}

export function searchTools(query: string) {
  const found = searchCatalogTools(query);
  const ids = new Set(found.map((item) => toolId(item)));
  return TOOLS.filter((item) => ids.has(toolId(item)));
}

export function getRelatedTools(item: CatalogTool | ToolDefinition) {
  return item.related
    .map((ref) => getTool(ref.category, ref.slug))
    .filter((found): found is ToolDefinition => Boolean(found));
}

