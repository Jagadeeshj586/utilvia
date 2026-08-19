import type { ToolSeoRecord } from "@/config/tools";
import { SITE } from "@/lib/site";
import { getCategory, toolHref, type ToolDefinition } from "@/lib/tools/catalog";

export function ToolJsonLd({
  tool,
  seo,
}: {
  tool: Pick<ToolDefinition, "slug" | "category" | "name">;
  seo: ToolSeoRecord;
}) {
  const url = `${SITE.url}${toolHref(tool)}`;
  const category = getCategory(tool.category);
  const categoryUrl = `${SITE.url}/category/${tool.category}`;

  const payload = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${url}#app`,
        name: seo.h1,
        url,
        applicationCategory: seo.schemaCategory,
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
        description: seo.description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        publisher: {
          "@type": "Organization",
          name: SITE.name,
          url: SITE.url,
        },
      },
      ...(seo.faqs.length
        ? [
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              mainEntity: seo.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            },
          ]
        : []),
      {
        "@type": "HowTo",
        "@id": `${url}#howto`,
        name: `How to use ${seo.h1}`,
        step: seo.howToSteps.map((item, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: item.step,
          text: item.text,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          { "@type": "ListItem", position: 2, name: category?.label ?? "Tools", item: categoryUrl },
          { "@type": "ListItem", position: 3, name: seo.h1, item: url },
        ],
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />
  );
}
