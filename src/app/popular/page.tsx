import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TitleTrustRow } from "@/components/layout/title-trust-row";
import { FeatureBanner } from "@/components/tools/feature-banner";
import { ToolGrid } from "@/components/tools/tool-grid";
import { getPopularTools } from "@/lib/tools/registry";

export const metadata: Metadata = {
  title: "Popular Tools",
  description: "The Utilvia utilities people open every day - PDF compress, image compress, EMI, JSON, and more.",
};

export default function PopularPage() {
  const tools = getPopularTools();

  return (
    <div className="max-site py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Popular Tools" }]} />
      <FeatureBanner
        className="mb-8"
        eyebrow="Most used"
        title="Start with what people open every day"
        body="PDF compress, image tools, EMI, JSON formatter, and other everyday utilities."
        href="/tools"
        cta="See all tools"
        icon={Sparkles}
        tone="dark"
      />
      <h1 className="font-display text-[32px] tracking-[-0.5px] sm:text-[40px]">Popular Tools</h1>
      <p className="mt-2 max-w-2xl text-[var(--body)]">Start with the utilities people reach for most often.</p>
      <TitleTrustRow className="mt-4" />
      <div className="mt-8">
        <ToolGrid tools={tools} featured emptyTitle="No popular tools yet" emptyDescription="Check back soon or browse the full catalog." />
      </div>
    </div>
  );
}
