import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdRegion } from "@/components/ads/ad-region";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { FeatureBanner } from "@/components/tools/feature-banner";
import { ToolGridSkeleton } from "@/components/tools/tool-skeleton";
import { ToolsExplorer } from "@/components/tools/tools-explorer";
import { CATEGORIES, getCategory, getToolsByCategory } from "@/lib/tools/catalog";

type Params = { category: string };

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.id }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const category = getCategory(params.category);
  if (!category) return {};
  return {
    title: category.label,
    description: category.description,
  };
}

export default function CategoryPage({ params }: { params: Params }) {
  const category = getCategory(params.category);
  if (!category) notFound();
  const count = getToolsByCategory(category.id).length;

  return (
    <div className="max-site py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/tools", label: "Tools" },
          { label: category.label },
        ]}
      />
      <FeatureBanner
        className="mb-8"
        eyebrow={category.label}
        title={`${count} tools in ${category.label}`}
        body={category.description}
        href="/tools"
        cta="Browse all tools"
        tone="cream"
      />
      <AdRegion name="categoryMid" className="mb-8 mt-0" />
      <Suspense fallback={<ToolGridSkeleton count={6} />}>
        <ToolsExplorer
          initialCategory={category.id}
          title={category.label}
          description={`${category.description} ${count} tools in this category.`}
        />
      </Suspense>
    </div>
  );
}
