import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TitleTrustRow } from "@/components/layout/title-trust-row";
import { ToolGridSkeleton } from "@/components/tools/tool-skeleton";
import { ToolLinkIndex } from "@/components/tools/tool-link-index";
import { ToolsExplorer } from "@/components/tools/tools-explorer";
import { buildMetadata } from "@/lib/seo";
import { getAllTools } from "@/lib/tools/catalog";

export const metadata = buildMetadata({
  title: "All Free Online Tools",
  description: "Browse every Utilvia utility — PDF, image, finance, developer, text, student, and productivity tools. Free, private, and in your browser.",
  path: "/tools",
});

export default function ToolsPage() {
  const tools = getAllTools();

  return (
    <div className="max-site py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "All Tools" }]} />
      <h1 className="font-display text-[32px] tracking-[-0.5px] sm:text-[40px]">All Tools</h1>
      <p className="mt-2 max-w-2xl leading-[1.65] text-[var(--body)]">
        Search, filter, and open any of {tools.length}+ Utilvia utilities.
      </p>
      <TitleTrustRow className="mt-4" />
      <div className="mt-8">
        <Suspense fallback={<ToolGridSkeleton count={9} />}>
          <ToolsExplorer omitHeader />
        </Suspense>
      </div>
      <ToolLinkIndex tools={tools} heading="Complete tool index" />
    </div>
  );
}
