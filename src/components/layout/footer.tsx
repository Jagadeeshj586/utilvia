import Link from "next/link";
import { Check, Mail } from "lucide-react";
import { BackToTop } from "@/components/layout/back-to-top";
import { Logo } from "@/components/layout/logo";
import { SITE } from "@/lib/site";
import { CATEGORIES, getPopularTools, toolHref } from "@/lib/tools/catalog";

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/favourites", label: "Favourites" },
  { href: "/popular", label: "Popular" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/sitemap.xml", label: "Sitemap" },
];

const TRUST_POINTS = [
  "Free forever",
  "No signup",
  "Private in browser",
  "Unlimited use",
  "No watermarks",
  "Mobile friendly",
  "Instant downloads",
] as const;

function categoryLabel(label: string) {
  return label.split(" / ")[0];
}

export function Footer() {
  const popularTools = getPopularTools().slice(0, 10);

  return (
    <footer className="relative mt-auto border-t border-[var(--hairline)] bg-canvas text-[var(--muted-ink)]">
      <div className="max-site py-10 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-3">
            <Logo />
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-[var(--muted-ink)]">
              {SITE.description}
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--hairline)] text-ink transition-colors duration-150 hover:border-primary/40 hover:text-primary"
                aria-label={`Email ${SITE.name}`}
              >
                <Mail className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>

          <nav aria-label="Categories" className="lg:col-span-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink">
              Categories
            </h2>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.id}`}
                    className="transition-colors duration-150 hover:text-ink"
                  >
                    {categoryLabel(category.label)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/tools"
                  className="font-medium text-ink transition-colors duration-150 hover:text-primary"
                >
                  All tools →
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Popular tools" className="lg:col-span-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink">
              Popular tools
            </h2>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {popularTools.map((tool) => (
                <li key={`${tool.category}/${tool.slug}`}>
                  <Link
                    href={toolHref(tool)}
                    className="transition-colors duration-150 hover:text-ink"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company" className="lg:col-span-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink">
              Company
            </h2>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors duration-150 hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal" className="lg:col-span-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink">
              Legal
            </h2>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors duration-150 hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-[var(--hairline)] pt-6 text-[12px] sm:gap-x-6 sm:text-[13px]">
          {TRUST_POINTS.map((point) => (
            <li key={point} className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-[var(--hairline)] pt-5 text-center text-[13px] sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} {SITE.name} — Fast, free & privacy-first tools.
          </p>
          <p className="text-[var(--muted-ink)]">{SITE.tagline}</p>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}
