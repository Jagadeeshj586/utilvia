import { getToolSeo } from "@/config/tools";
import { CATEGORIES, getAllTools, getRelatedTools, toolHref } from "@/lib/tools/catalog";

function clip(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function run() {
  const tools = getAllTools();
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();
  let missing = 0;

  for (const tool of tools) {
    const seo = getToolSeo({
      slug: tool.slug,
      category: tool.category,
      name: tool.name,
      heading: tool.heading,
      shortDescription: tool.shortDescription,
      keywords: tool.keywords,
      metaTitle: tool.metaTitle,
      metaDescription: tool.metaDescription,
      fileUpload: tool.fileUpload,
      privacy: tool.privacy === "mixed" ? "mixed" : "local",
      badge: tool.badge,
      faqs: tool.faqs,
    });

    const issues: string[] = [];
    if (!seo.title) issues.push("missing title");
    if (!seo.description) issues.push("missing description");
    if (!seo.h1) issues.push("missing h1");
    if (seo.description.length < 50) issues.push("short description");
    if (seo.description.length > 170) issues.push("long description");

    const titleKey = clip(seo.title).toLowerCase();
    const descKey = clip(seo.description).toLowerCase();
    if (titles.has(titleKey)) issues.push(`duplicate title with ${titles.get(titleKey)}`);
    else titles.set(titleKey, `${tool.category}/${tool.slug}`);
    if (descriptions.has(descKey)) issues.push(`duplicate description with ${descriptions.get(descKey)}`);
    else descriptions.set(descKey, `${tool.category}/${tool.slug}`);

    if (issues.length) {
      missing += 1;
      console.log(`✗ ${tool.category}/${tool.slug} — ${issues.join("; ")}`);
    }
  }

  const sitemapPaths = new Set([
    "/",
    "/tools",
    "/popular",
    "/faq",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    ...CATEGORIES.map((category) => `/category/${category.id}`),
    ...tools.map((tool) => toolHref(tool)),
  ]);

  const orphans = tools.filter((tool) => {
    const related = getRelatedTools(tool);
    return related.length === 0;
  });

  console.log(`\nSEO AUDIT: ${tools.length - missing}/${tools.length} tools look complete.`);
  console.log(`Unique titles: ${titles.size}. Unique descriptions: ${descriptions.size}.`);
  console.log(`Sitemap paths: ${sitemapPaths.size}. Tools with no related links: ${orphans.length}.`);
  if (missing) process.exitCode = 1;
}

run();
