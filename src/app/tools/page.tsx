import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ToolGridSkeleton } from "@/components/tools/tool-skeleton";
import { ToolsExplorer } from "@/components/tools/tools-explorer";
import { buildMetadata } from "@/lib/seo";
import { getAllTools } from "@/lib/tools/catalog";

export const metadata = buildMetadata({
  title: "All Free Online Tools",
  description: "Browse every Utilvia utility — PDF, image, finance, developer, text, student, and productivity tools. Free, private, and in your browser.",
  path: "/tools",
});

export default function ToolsPage() {
  const total = getAllTools().length;

  return (
    <div className="max-site py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "All Tools" }]} />
      <Suspense fallback={<ToolGridSkeleton count={9} />}>
        <ToolsExplorer title="All Tools" description={`Search, filter, and open any of ${total}+ Utilvia utilities.`} />
      </Suspense>
    </div>
  );
}
