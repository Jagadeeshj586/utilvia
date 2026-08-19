import { SITE } from "@/lib/site";

export function SiteJsonLd() {
  const payload = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE.url}#organization`,
        name: SITE.name,
        url: SITE.url,
        email: SITE.email,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.url}#website`,
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        publisher: { "@id": `${SITE.url}#organization` },
        inLanguage: "en",
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />
  );
}
