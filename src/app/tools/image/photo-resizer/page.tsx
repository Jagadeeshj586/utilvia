import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SITE } from "@/lib/site";

/**
 * Utilvia SEO tool page template
 *
 * Clone this file for a new tool, then replace the PAGE constants.
 *
 * Tool Name: Aadhaar Photo & Signature Resizer
 * Tool Slug / Path: /tools/image/photo-resizer
 * Category: Image Tools
 * Category URL: /category/image
 * Target Primary Keyword: Aadhaar photo resizer online
 * Secondary Keywords: resize photo for aadhaar card, 3.5 x 4.5 cm photo converter,
 *   aadhaar card signature resize under 50kb
 * Core Benefit / USP: 100% in-browser processing, exact official dimensions,
 *   auto-compression to under 50KB, no server uploads
 */

const PATH = "/tools/image/photo-resizer";
const CANONICAL = `${SITE.url}${PATH}`;
const TITLE = "Aadhaar Photo Resizer Online - 100% Private | Utilvia";
const DESCRIPTION =
  "Resize Aadhaar photo and signature to 3.5 x 4.5 cm under 50KB. 100% private in-browser processing, no server uploads. Free Aadhaar photo resizer online.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "Aadhaar photo resizer online",
    "resize photo for aadhaar card",
    "3.5 x 4.5 cm photo converter",
    "aadhaar card signature resize under 50kb",
    "UIDAI photo size",
    "Aadhaar signature 10KB",
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    siteName: SITE.name,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

const FAQS = [
  {
    question: "Is my Aadhaar photo uploaded to a server?",
    answer:
      "No. Utilvia resizes your Aadhaar photo and signature entirely in your browser with the Canvas API. The file never leaves this device, is not uploaded to Utilvia, and is not stored after you close the tab.",
  },
  {
    question: "What size should an Aadhaar photo and signature be?",
    answer:
      "UIDAI expects a 3.5 × 4.5 cm (35 × 45 mm) colour photograph, typically 413 × 531 pixels at 300 DPI, compressed under 50 KB (often 20–50 KB). The signature should be a clear scan, usually under 10 KB. This tool’s Aadhaar preset applies those photo dimensions and a 50 KB cap.",
  },
  {
    question: "Which formats can I upload?",
    answer:
      "JPG, JPEG, PNG, and WebP are supported. After you crop to the Aadhaar frame, the tool exports a JPEG sized for the UIDAI upload field. HEIC from iPhones should be converted to JPG first with Utilvia’s HEIC to JPG tool.",
  },
  {
    question: "Will compression make my Aadhaar photo look blurry?",
    answer:
      "The resizer keeps the 3.5 × 4.5 cm crop, then lowers JPEG quality only as far as needed to stay under 50 KB. Start with a well-lit, front-facing photo on a plain background. Soft studio lighting compresses more cleanly than a dark selfie.",
  },
] as const;

const RELATED = [
  {
    href: "/tools/image/image-compressor",
    name: "Image Compressor",
    blurb: "Shrink any JPG or PNG for portals that cap file size below 200 KB.",
  },
  {
    href: "/tools/image/background-remover",
    name: "Background Remover",
    blurb: "Cut a plain Aadhaar background on-device before you resize.",
  },
  {
    href: "/tools/image/heic-to-jpg",
    name: "HEIC to JPG",
    blurb: "Convert iPhone photos so UIDAI accepts the file type.",
  },
  {
    href: "/tools/pdf/compress-pdf",
    name: "PDF Compress",
    blurb: "Reduce supporting PDFs when a form asks for photo plus documents.",
  },
] as const;

function ToolSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading photo resizer">
      <div className="h-10 w-1/3 animate-pulse rounded-md bg-surface-card" />
      <div className="h-48 animate-pulse rounded-lg bg-surface-card" />
      <div className="h-10 w-1/4 animate-pulse rounded-md bg-surface-card" />
    </div>
  );
}

const PhotoResizer = dynamic(
  () => import("@/components/tools/image/photo-cropper").then((module) => module.PhotoCropper),
  { ssr: false, loading: ToolSkeleton },
);

function JsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${CANONICAL}#app`,
        name: "Aadhaar Photo Resizer Online",
        url: CANONICAL,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript. Works in Chrome, Firefox, Safari, and Edge.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        isAccessibleForFree: true,
        featureList: [
          "100% in-browser processing with no server uploads",
          "Official 3.5 × 4.5 cm (413 × 531 px) Aadhaar photo preset",
          "Auto-compression to stay under 50 KB",
          "PAN, passport, visa, and custom size presets",
        ],
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        description: DESCRIPTION,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Image Tools", item: `${SITE.url}/category/image` },
          { "@type": "ListItem", position: 3, name: "Aadhaar Photo Resizer", item: CANONICAL },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      {
        "@type": "HowTo",
        name: "How to resize a photo for Aadhaar card online",
        totalTime: "PT1M",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Upload your photo",
            text: "Drop a JPG, PNG, or WebP. Processing stays in this browser tab.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Choose the Aadhaar preset",
            text: "Select Aadhaar Card to lock 3.5 × 4.5 cm (413 × 531 px) and a 50 KB limit.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Crop the face",
            text: "Centre the face, keep a plain background, and leave a small margin above the hair.",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Download under 50 KB",
            text: "Export the JPEG. The tool compresses until the file is ready for the UIDAI upload field.",
          },
        ],
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
  );
}

export default function PhotoResizerPage() {
  return (
    <div className="max-site py-8 sm:py-10">
      <JsonLd />

      <nav aria-label="Breadcrumb" className="text-sm text-[var(--body)]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="text-primary hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/category/image" className="text-primary hover:underline">
              Image Tools
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">Aadhaar Photo Resizer</li>
        </ol>
      </nav>

      <header className="mt-6 max-w-3xl">
        <h1 className="font-display text-[32px] font-semibold leading-[1.15] tracking-[-0.5px] text-ink sm:text-[40px]">
          Aadhaar Photo Resizer Online
        </h1>
        <p className="mt-3 text-base leading-[1.65] text-[var(--body)]">
          Resize a photo for Aadhaar card to the official 3.5 × 4.5 cm size under 50 KB — 100% in your
          browser, with no server uploads.
        </p>
      </header>

      <section
        className="mt-8 rounded-lg border border-[var(--hairline)] bg-canvas p-5 sm:p-6"
        aria-label="Aadhaar photo resizer workspace"
      >
        <PhotoResizer />
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="how-to-heading">
        <h2 id="how-to-heading" className="font-display text-[22px] tracking-[-0.3px] text-ink">
          How to resize a photo for Aadhaar card
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-base leading-[1.65] text-[var(--body)]">
          <li>
            <strong className="font-medium text-ink">Upload the original.</strong> Use a recent colour
            photo on a plain background. Files stay on this device.
          </li>
          <li>
            <strong className="font-medium text-ink">Select the Aadhaar Card preset.</strong> That locks
            35 × 45 mm (413 × 531 px at 300 DPI) and a 50 KB ceiling used by UIDAI portals.
          </li>
          <li>
            <strong className="font-medium text-ink">Crop so the face fills the frame.</strong> Keep the
            head centred, shoulders visible, and a small gap above the hair.
          </li>
          <li>
            <strong className="font-medium text-ink">Download the JPEG.</strong> Open the file size in
            Finder or Explorer to confirm it is under 50 KB before you upload to myAadhaar.
          </li>
        </ol>
      </section>

      <section className="mt-12" aria-labelledby="specs-heading">
        <h2 id="specs-heading" className="font-display text-[22px] tracking-[-0.3px] text-ink">
          Aadhaar photo specifications
        </h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--hairline)]">
          <table className="w-full min-w-[36rem] text-left text-sm text-[var(--body)]">
            <caption className="sr-only">UIDAI-oriented photo and signature size limits</caption>
            <thead className="bg-surface-soft text-ink">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Requirement
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Aadhaar photo
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Aadhaar signature
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[var(--hairline)]">
                <th scope="row" className="px-4 py-3 font-medium text-ink">
                  Printed size
                </th>
                <td className="px-4 py-3">3.5 × 4.5 cm (35 × 45 mm)</td>
                <td className="px-4 py-3">Clear scan of the full signature</td>
              </tr>
              <tr className="border-t border-[var(--hairline)] bg-surface-soft/60">
                <th scope="row" className="px-4 py-3 font-medium text-ink">
                  Pixel size (300 DPI)
                </th>
                <td className="px-4 py-3">413 × 531 pixels</td>
                <td className="px-4 py-3">Typically a wide, short crop</td>
              </tr>
              <tr className="border-t border-[var(--hairline)]">
                <th scope="row" className="px-4 py-3 font-medium text-ink">
                  File size
                </th>
                <td className="px-4 py-3">Under 50 KB (often 20–50 KB)</td>
                <td className="px-4 py-3">Usually under 10 KB</td>
              </tr>
              <tr className="border-t border-[var(--hairline)] bg-surface-soft/60">
                <th scope="row" className="px-4 py-3 font-medium text-ink">
                  Format
                </th>
                <td className="px-4 py-3">JPG / JPEG</td>
                <td className="px-4 py-3">JPG / JPEG</td>
              </tr>
              <tr className="border-t border-[var(--hairline)]">
                <th scope="row" className="px-4 py-3 font-medium text-ink">
                  Background
                </th>
                <td className="px-4 py-3">Plain white or light</td>
                <td className="px-4 py-3">White paper, dark ink</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm leading-[1.65] text-[var(--body)]">
          UIDAI can update portal limits. If an upload still fails, compress one more step with the{" "}
          <Link href="/tools/image/image-compressor" className="text-primary hover:underline">
            Image Compressor
          </Link>{" "}
          or recrop so the face fills more of the frame.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="benefits-heading">
        <h2 id="benefits-heading" className="font-display text-[22px] tracking-[-0.3px] text-ink">
          Why resize Aadhaar photos on Utilvia
        </h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-[1.65] text-[var(--body)]">
          <li>
            <strong className="font-medium text-ink">Client-side privacy.</strong> Cropping and JPEG
            compression run in this tab. Utilvia never sees the photograph.
          </li>
          <li>
            <strong className="font-medium text-ink">Official dimensions, not a guess.</strong> The
            Aadhaar preset is 3.5 × 4.5 cm at 413 × 531 px — the size most myAadhaar photo fields
            expect.
          </li>
          <li>
            <strong className="font-medium text-ink">Size cap without a second app.</strong>{" "}
            Auto-compression targets under 50 KB so you are not bouncing between a cropper and a
            compressor.
          </li>
        </ul>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="font-display text-[22px] tracking-[-0.3px] text-ink">
          Aadhaar photo resizer FAQ
        </h2>
        <div className="mt-4 divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group py-4">
              <summary className="cursor-pointer list-none font-display text-[18px] font-medium leading-snug tracking-[-0.02em] text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                {faq.question}
              </summary>
              <p className="mt-3 text-[15px] leading-[1.65] text-[var(--body)]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="related-heading">
        <h2 id="related-heading" className="font-display text-[22px] tracking-[-0.3px] text-ink">
          Related image tools
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {RELATED.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-lg border border-[var(--hairline)] bg-surface-card p-4 no-underline transition-colors duration-150 hover:border-primary"
              >
                <span className="font-medium text-primary">{item.name}</span>
                <span className="mt-1 block text-sm leading-[1.65] text-[var(--body)]">{item.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
