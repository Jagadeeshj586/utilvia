import type { ToolDefinition } from "@/lib/tools/registry";
import { SITE } from "@/lib/site";
import { toolHref } from "@/lib/tools/registry";

export function ToolJsonLd({ tool }: { tool: ToolDefinition }) {
  const url = `${SITE.url}${toolHref(tool)}`;
  const payload = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: tool.name,
      applicationCategory: "BrowserApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: tool.longDescription,
      url,
      publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: tool.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />
  );
}
