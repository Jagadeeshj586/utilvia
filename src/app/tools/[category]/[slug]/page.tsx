import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolJsonLd } from "@/components/seo/json-ld";
import { ToolRenderer } from "@/components/tools/tool-renderer";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import { SITE } from "@/lib/site";
import { getAllTools, getTool, toolHref } from "@/lib/tools/registry";

type Params = { category: string; slug: string };

export function generateStaticParams() {
  return getAllTools().map((tool) => ({ category: tool.category, slug: tool.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const tool = getTool(params.category, params.slug);
  if (!tool) return {};
  const url = `${SITE.url}${toolHref(tool)}`;
  const title = tool.metaTitle ?? tool.name;
  const description = tool.metaDescription ?? tool.shortDescription;
  return {
    title: tool.metaTitle ? { absolute: tool.metaTitle } : tool.name,
    description,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} - ${SITE.name}`,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function ToolPage({ params }: { params: Params }) {
  const tool = getTool(params.category, params.slug);
  if (!tool) notFound();

  return (
    <>
      <ToolJsonLd tool={tool} />
      <ToolWorkspace tool={tool}>
        <ToolRenderer category={tool.category} slug={tool.slug} />
      </ToolWorkspace>
    </>
  );
}
