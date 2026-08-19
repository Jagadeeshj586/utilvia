import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export function canonicalUrl(path = "/") {
  const normalized = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  return normalized === "/" ? SITE.url : `${SITE.url}${normalized}`;
}

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  index = true,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  index?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  const url = canonicalUrl(path);
  const fullTitle = absoluteTitle ? title : title;

  return {
    title: absoluteTitle ? { absolute: fullTitle } : fullTitle,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE.name,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}
