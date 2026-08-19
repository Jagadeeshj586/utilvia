import type { ReactNode } from "react";
import { AdRegion } from "@/components/ads/ad-region";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TitleTrustRow } from "@/components/layout/title-trust-row";
import { ToolSeoContent } from "@/components/seo/tool-seo-content";
import { PrivacyBadge } from "@/components/tools/privacy-badge";
import { ToolCard } from "@/components/tools/tool-card";
import { RecentsTracker, ToolSaveButton } from "@/components/tools/tool-save-button";
import type { ToolSeoRecord } from "@/config/tools";
import { getCategory, getRelatedTools, toolId, type ToolDefinition } from "@/lib/tools/catalog";
import { CATEGORY_STYLES, getToolIcon } from "@/lib/tools/icons";

export function ToolWorkspace({
  tool,
  seo,
  children,
}: {
  tool: ToolDefinition;
  seo?: ToolSeoRecord;
  children: ReactNode;
}) {
  const id = toolId(tool);
  const related = getRelatedTools(tool);
  const category = getCategory(tool.category);
  const Icon = getToolIcon(tool.icon);
  const style = CATEGORY_STYLES[tool.category];

  return (
    <div className="max-site py-8 sm:py-10">
      <RecentsTracker toolId={id} />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: `/category/${tool.category}`, label: category?.label ?? tool.category },
          { label: seo?.h1 ?? tool.heading ?? tool.name },
        ]}
      />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg bg-surface-card ${style.iconFg}`}>
              <Icon className="h-5 w-5" />
            </span>
            <h1 className="font-display text-[32px] leading-tight tracking-[-0.5px] sm:text-[40px]">
              {seo?.h1 ?? tool.heading ?? tool.name}
            </h1>
          </div>
          <p className="text-base leading-[1.65] text-[var(--body)]">{tool.longDescription}</p>
          <TitleTrustRow className="mt-4" />
          {tool.rulesBanner ? (
            <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1.5 text-sm text-[var(--body)]">
              {tool.rulesBannerFlag ? <span aria-hidden>{tool.rulesBannerFlag}</span> : null}
              <span>{tool.rulesBanner}</span>
            </div>
          ) : null}
          {tool.fileUpload ? <PrivacyBadge className="mt-4" /> : null}
        </div>
        <ToolSaveButton toolId={id} />
      </div>

      <AdRegion name="toolBelowIntro" className="mb-8 mt-0" />

      <section className="rounded-lg border border-[var(--hairline)] bg-canvas p-5 sm:p-6">{children}</section>

      <AdRegion name="toolBelowWorkspace" />

      {seo ? (
        <ToolSeoContent seo={seo} localFirst={tool.privacy !== "mixed"} />
      ) : (
        <section className="mt-10">
          <h2 className="font-display text-[22px] tracking-[-0.3px]">About {tool.name}</h2>
          <div className="mt-4 space-y-4 text-sm leading-[1.65] text-[var(--body)]">
            {(tool.about?.paragraphs ?? []).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {tool.about?.features?.length ? (
              <div>
                <p className="mb-2 font-medium text-ink">Key features</p>
                <ul className="list-disc space-y-1.5 pl-5">
                  {tool.about.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      )}

      <AdRegion name="toolBottom" />

      {related.length ? (
        <section className="mt-10">
          <h2 className="font-display text-[22px] tracking-[-0.3px]">Related tools</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ToolCard key={toolId(item)} tool={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
