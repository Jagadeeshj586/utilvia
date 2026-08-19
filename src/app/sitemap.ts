import type { MetadataRoute } from "next";
import { isHighIntentTool } from "@/config/tools";
import { SITE } from "@/lib/site";
import { CATEGORIES, getAllTools, toolHref } from "@/lib/tools/catalog";

function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    entry("/", "daily", 1),
    entry("/tools", "daily", 0.9),
    entry("/popular", "daily", 0.8),
    entry("/faq", "monthly", 0.6),
    entry("/about", "monthly", 0.5),
    entry("/contact", "monthly", 0.5),
    entry("/privacy", "monthly", 0.5),
    entry("/terms", "monthly", 0.5),
  ];

  const categories = CATEGORIES.map((category) => entry(`/category/${category.id}`, "daily", 0.8));

  const tools = getAllTools().map((tool) =>
    entry(toolHref(tool), "monthly", isHighIntentTool(tool) ? 0.9 : 0.7),
  );

  return [...staticRoutes, ...categories, ...tools];
}
