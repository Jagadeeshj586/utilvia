import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { CATEGORIES, getAllTools, toolHref } from "@/lib/tools/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/tools", "/popular", "/faq", "/about", "/privacy", "/terms", "/contact"].map(
    (path) => ({
      url: `${SITE.url}${path || "/"}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    }),
  );

  const categories = CATEGORIES.map((category) => ({
    url: `${SITE.url}/category/${category.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const tools = getAllTools().map((tool) => ({
    url: `${SITE.url}${toolHref(tool)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: tool.status === "ready" ? 0.9 : 0.5,
  }));

  return [...staticRoutes, ...categories, ...tools];
}
