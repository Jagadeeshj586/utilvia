import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolJsonLd } from "@/components/seo/tool-json-ld";
import { ToolRenderer } from "@/components/tools/tool-renderer";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import { getToolSeo } from "@/config/tools";
import { SITE } from "@/lib/site";
import { getAllTools, getTool, toolHref } from "@/lib/tools/registry";

type Params = { category: string; slug: string };

export function generateStaticParams() {
  return getAllTools().map((tool) => ({ category: tool.category, slug: tool.slug }));
}

function seoForTool(tool: NonNullable<ReturnType<typeof getTool>>) {
  return getToolSeo({
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
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const tool = getTool(params.category, params.slug);
  if (!tool) return {};
  const seo = seoForTool(tool);
  const url = `${SITE.url}${toolHref(tool)}`;
  return {
    title: { absolute: seo.title },
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      siteName: SITE.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
    robots: { index: true, follow: true },
  };
}

export default function ToolPage({ params }: { params: Params }) {
  const tool = getTool(params.category, params.slug);
  if (!tool) notFound();
  const seo = seoForTool(tool);

  return (
    <>
      <ToolJsonLd tool={tool} seo={seo} />
      <ToolWorkspace tool={tool} seo={seo}>
        <ToolRenderer category={tool.category} slug={tool.slug} />
      </ToolWorkspace>
    </>
  );
}
