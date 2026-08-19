import { SITE } from "@/lib/site";
import { toolHref, type ToolDefinition } from "@/lib/tools/catalog";

export function CategoryJsonLd({
  name,
  description,
  path,
  tools,
}: {
  name: string;
  description: string;
  path: string;
  tools: ToolDefinition[];
}) {
  const url = `${SITE.url}${path}`;
  const payload = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    isPartOf: { "@id": `${SITE.url}#website` },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: tools.length,
      itemListElement: tools.slice(0, 30).map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.name,
        url: `${SITE.url}${toolHref(tool)}`,
      })),
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />
  );
}
