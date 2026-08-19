import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { SITE } from "@/lib/site";
import { CATEGORIES } from "@/lib/tools/catalog";

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--hairline)] bg-canvas text-[var(--muted-ink)]">
      <div className="max-site py-8 sm:py-10">
        <div className="flex flex-col items-center gap-4 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <Logo />
          <nav
            aria-label="Company"
            className="flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[14px] lg:w-auto lg:justify-end lg:gap-x-6"
          >
            {COMPANY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 transition-colors duration-150 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <nav
          aria-label="Tool categories"
          className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px]"
        >
          <Link href="/tools" className="font-medium text-ink hover:text-primary">
            All tools
          </Link>
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="transition-colors duration-150 hover:text-ink"
            >
              {category.label}
            </Link>
          ))}
        </nav>
        <p className="mt-5 text-center text-[13px]">
          © {new Date().getFullYear()} {SITE.name}. Free tools for everyone.
        </p>
      </div>
    </footer>
  );
}
