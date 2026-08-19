import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, Sparkles, UserRoundX } from "lucide-react";
import { GradientBackground } from "@/components/brand/gradient-background";
import { TrustBar } from "@/components/layout/trust-bar";
import { TitleTrustRow } from "@/components/layout/title-trust-row";
import { HeroSearch } from "@/components/search/hero-search";
import { ToolGrid } from "@/components/tools/tool-grid";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { CATEGORIES, getAllTools, getPopularTools } from "@/lib/tools/catalog";

const HeroGlobe = dynamic(
  () => import("@/components/brand/hero-globe").then((mod) => mod.HeroGlobe),
  { ssr: false },
);

const QUICK_ACTIONS = [
  { label: "Compress PDF", href: "/tools/pdf/compress-pdf" },
  { label: "Aadhaar Photo Resize", href: "/tools/image/photo-resizer" },
  { label: "Image Compress", href: "/tools/image/image-compressor" },
  { label: "PDF to Word", href: "/tools/pdf/pdf-to-word" },
  { label: "Word to PDF", href: "/tools/pdf/word-to-pdf" },
];

export default function HomePage() {
  const popular = getPopularTools().slice(0, 12);
  const toolCount = getAllTools().length;

  return (
    <div>
      <section className="hero-shell relative isolate flex min-h-[70svh] flex-col justify-center py-12 pb-28 sm:py-14 sm:pb-36">
        <GradientBackground />
        <HeroGlobe />
        <div className="relative z-20 mx-auto w-full max-w-[1200px] px-4 text-center sm:px-6">
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[1.5px] text-[var(--muted-ink)]">
            {SITE.positioning}
          </p>
          <h1 className="mx-auto max-w-4xl font-display text-[32px] font-semibold leading-[1.05] tracking-[-1.5px] text-ink sm:text-[48px] lg:text-[56px]">
            Free In-Browser Online Tools &amp; File Utilities
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[16px] font-normal leading-[1.65] text-[var(--body)]">
            Convert, calculate, compress, generate, format and simplify everyday tasks - directly in your browser.
          </p>
          <TitleTrustRow className="mt-5" align="center" />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="h-10 rounded-md px-5 text-[14px] font-medium">
              <Link href="/tools">
                Explore All Tools
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-10 rounded-md px-5 text-[14px] font-medium">
              <Link href="/popular">Popular Tools</Link>
            </Button>
          </div>
          <div className="mt-6">
            <p className="mb-3 text-[14px] font-medium text-[var(--muted-ink)]">What do you need to do?</p>
            <HeroSearch className="relative z-30" />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {QUICK_ACTIONS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-[var(--hairline)] bg-canvas px-3.5 py-1.5 text-[13px] font-medium text-[var(--body)] shadow-[0_1px_0_rgba(20,20,19,0.04)] transition-colors duration-150 hover:border-primary hover:text-primary dark:bg-surface-soft"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-12 sm:py-16">
        <div className="max-site">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.8px] text-ink sm:text-[40px]">
              Why {SITE.name}?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-[1.65] text-[var(--body)]">
              A quiet, dependable workspace for the small tasks that fill your day.
            </p>
          </div>
          <TrustBar className="mt-10" />
        </div>
      </section>

      <section id="popular" className="max-site pb-12 sm:pb-16">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-card text-primary">
                <Sparkles className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h2 className="font-display text-[32px] font-semibold leading-[1.15] tracking-[-0.5px] sm:text-[36px]">
                Popular Tools
              </h2>
            </div>
            <p className="mt-2 max-w-xl text-[15px] leading-[1.55] text-[var(--body)]">
              The tools people open most often.
            </p>
          </div>
          <Link href="/popular" className="mt-2 shrink-0 text-sm font-medium text-primary transition-colors duration-150 hover:underline">
            View all →
          </Link>
        </div>
        <ToolGrid tools={popular} featured />
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/tools">
              View all tools
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <section className="max-site pb-12 sm:pb-16" aria-labelledby="categories-heading">
        <div className="mb-6 text-center">
          <h2 id="categories-heading" className="font-display text-[32px] font-semibold leading-[1.15] tracking-[-0.5px] sm:text-[36px]">
            Browse free online tools by category
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-[15px] leading-[1.55] text-[var(--body)]">
            PDF compressors, image utilities, EMI and tax calculators, text tools, and developer formatters — all in the browser.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-4 text-left transition-colors duration-150 hover:border-primary"
            >
              <p className="font-medium text-ink">{category.label}</p>
              <p className="mt-1 text-[13px] leading-[1.5] text-[var(--body)]">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Utilvia at a glance" className="max-site">
        <div className="grid divide-y divide-[var(--hairline)] rounded-xl border border-[var(--hairline)] bg-surface-soft py-8 md:grid-cols-3 md:divide-x md:divide-y-0 md:py-12">
          {[
            { value: `${toolCount}+ Tools`, label: "Available now" },
            { value: "Instant", label: "Most tools need no upload — runs in your browser" },
            { value: "Free Forever", label: "No hidden fees" },
          ].map((item) => (
            <div key={item.value} className="px-6 py-6 text-center md:py-2">
              <p className="text-[22px] font-semibold leading-tight text-ink sm:text-[24px]">{item.value}</p>
              <p className="mx-auto mt-1.5 max-w-[16rem] text-[14px] leading-[1.5] text-[var(--body)]">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-site pt-12 sm:pt-16" aria-labelledby="privacy-heading">
        <div className="rounded-xl border border-[var(--hairline)] bg-surface-soft px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="privacy-heading"
                className="font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.5px] text-ink sm:text-[32px]"
              >
                Privacy &amp; Security
              </h2>
              <p className="mt-2 max-w-md text-[15px] leading-[1.55] text-[var(--body)]">
                Your files stay on this device. We never see them.
              </p>
            </div>
            <Link
              href="/privacy"
              className="text-sm font-medium text-primary transition-colors duration-150 hover:underline"
            >
              Privacy policy →
            </Link>
          </div>

          <ul className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-8">
            {[
              {
                icon: Lock,
                title: "Runs in your browser",
                body: "PDFs, photos, and numbers stay in this tab.",
              },
              {
                icon: ShieldCheck,
                title: "Nothing is stored",
                body: "Close the tab and it is gone.",
              },
              {
                icon: UserRoundX,
                title: "No account needed",
                body: "Open a tool and finish. No signup.",
              },
            ].map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--hairline)] bg-canvas text-primary">
                  <item.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <p className="text-[15px] font-medium leading-snug text-ink">{item.title}</p>
                  <p className="mt-1 text-[14px] leading-[1.5] text-[var(--body)]">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-site pb-12 pt-12 sm:pb-16 sm:pt-16">
        <div className="rounded-lg bg-[var(--coral)] px-6 py-10 text-center text-[var(--on-primary)] sm:px-12 sm:py-12">
          <h2 className="font-display text-[28px] font-semibold leading-[1.2] tracking-[-0.3px] sm:text-[32px]">
            Can&apos;t find what you need?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-[1.65] text-white/85 sm:text-base">
            Tell us what tool you want us to build next.
          </p>
          <Button asChild variant="cream" className="mt-6">
            <Link href="/contact">Suggest a Tool</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
