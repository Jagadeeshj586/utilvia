import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ToolGridSkeleton } from "@/components/tools/tool-skeleton";
import { ToolsExplorer } from "@/components/tools/tools-explorer";
import { getAllTools } from "@/lib/tools/catalog";

export const metadata: Metadata = {
  title: "All Tools",
  description: "Browse every Utilvia utility - PDF, image, finance, developer, text, student, and productivity tools.",
};

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
