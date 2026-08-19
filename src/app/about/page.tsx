import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TitleTrustRow } from "@/components/layout/title-trust-row";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { getAllTools } from "@/lib/tools/catalog";

export const metadata = buildMetadata({
  title: "About Utilvia",
  description: `${SITE.name} is a free, privacy-first workspace for everyday PDF, image, calculator, and developer tools. No signup.`,
  path: "/about",
});

export default function AboutPage() {
  const toolCount = getAllTools().length;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "About" }]} />
      <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.03em] sm:text-[2.25rem]">About {SITE.name}</h1>
      <TitleTrustRow className="mt-4" />

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Who built {SITE.name}?</h2>
        <p className="mt-3 text-[16px] leading-[1.7] text-[var(--body)]">
          {SITE.name} started as a simple idea: one clean place for the small jobs people do every day - compressing a
          PDF for a portal, resizing an Aadhaar photo, checking EMI or GST, formatting JSON, or generating a QR code -
          without bouncing across a dozen cluttered websites.
        </p>
        <p className="mt-3 text-[16px] leading-[1.7] text-[var(--body)]">
          Most “free tool” sites bury the download behind ads, fake buttons, and account walls. {SITE.name} is built for
          Indian employees, software engineers, students, and freelancers who just need the tool to work. Search, open,
          finish the task. No signup.
        </p>
        <p className="mt-4 text-[16px] leading-[1.7] text-[var(--body)]">
          Have a question or want a new tool?{" "}
          <Link href="/contact" className="font-medium text-primary hover:underline">
            Contact us
          </Link>
          {" · "}
          <a href={`mailto:${SITE.email}`} className="font-medium text-primary hover:underline">
            {SITE.email}
          </a>
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">
          Our technical philosophy: privacy-first architecture
        </h2>
        <p className="mt-3 text-[16px] leading-[1.7] text-[var(--body)]">
          Most {SITE.name} utilities run entirely in your browser with client-side JavaScript. PDFs, images, and text
          you drop into a tool stay on your device. On file tools we state it plainly: {SITE.privacyNote.toLowerCase()}
        </p>
        <p className="mt-3 text-[16px] leading-[1.7] text-[var(--body)]">
          A few tools need a public data feed - for example live currency or crypto rates. Those pages say so clearly.
          We do not hide uploads behind a generic “processing” spinner.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">What we do</h2>
        <p className="mt-3 text-[16px] leading-[1.7] text-[var(--body)]">
          {SITE.name} is a free workspace with {toolCount}+ browser-based tools across PDF, image, text, developer,
          finance and tax, student, and productivity. Compress and merge PDFs, shrink photos, run EMI or India tax math,
          format JSON, and more - optimized for professionals and students. No signup and no paywall on everyday
          features.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Why we built this</h2>
        <p className="mt-3 text-[16px] leading-[1.7] text-[var(--body)]">
          Utility sites are often slow, noisy, and extractive: tracking scripts, forced accounts, and download buttons
          that are actually ads. That wastes time and puts files you care about on someone else’s server.
        </p>
        <p className="mt-3 text-[16px] leading-[1.7] text-[var(--body)]">
          We wanted the opposite - fast, clean, and minimal, with respect for your time and data. Open a tool, get the
          result, move on.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Built with</h2>
        <p className="mt-3 text-[16px] leading-[1.7] text-[var(--body)]">
          {SITE.name} is a Next.js app styled with Tailwind CSS. File tools rely on libraries such as pdf-lib, PDF.js,
          browser-image-compression, JSZip, and native Web APIs so work can stay on-device. Charts, QR codes, and
          background removal use focused client libraries only where they earn their keep.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[16px] leading-[1.7] text-[var(--body)]">
          <li>
            <span className="font-medium text-ink">Framework &amp; styling:</span> Next.js, React, Tailwind CSS
          </li>
          <li>
            <span className="font-medium text-ink">Documents &amp; images:</span> pdf-lib, pdfjs-dist, browser-image-compression,
            JSZip
          </li>
          <li>
            <span className="font-medium text-ink">Other client tools:</span> qr-code-styling, Recharts, Web APIs, and on-device
            ML for background removal
          </li>
        </ul>
      </section>
    </article>
  );
}
