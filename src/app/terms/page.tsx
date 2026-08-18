import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms of use for ${SITE.name} browser tools. Contact ${SITE.email}.`,
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-[36px] tracking-[-0.5px] sm:text-[40px]">Terms &amp; Conditions</h1>
      <p className="mt-2 text-sm text-[var(--muted-ink)]">Last updated: August 17, 2026</p>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Acceptance of Terms</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">
          By using {SITE.name}, you agree to these Terms &amp; Conditions and our{" "}
          <Link href="/privacy" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          . If you do not agree, please do not use the site.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Use of Tools</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">
          All tools on {SITE.name} are provided free of charge for personal and professional use. You may not use our
          tools for any illegal or harmful purposes.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">File Processing &amp; Privacy</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">
          Most {SITE.name} tools process files and inputs locally in your browser. A small number of tools use secure
          server-side processing or send queries to external APIs — this is clearly noted on each tool page. {SITE.name}{" "}
          does not require an account. See our{" "}
          <Link href="/privacy" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Analytics &amp; Cookies</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">
          {SITE.name} may collect minimal anonymous usage data to improve the product. The site also uses first-party
          cookies and browser storage for preferences such as theme, favorites, and recent tools. See our{" "}
          <Link href="/privacy" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Advertising</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">
          {SITE.name} may introduce Google AdSense or similar advertising services in the future. Our Terms and Privacy
          Policy will be updated before ads are enabled. See our{" "}
          <Link href="/privacy" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Intellectual Property</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">
          The {SITE.name} name, logo, and website design are the property of {SITE.name}. You may not copy or reproduce
          any part of this website without permission.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Disclaimer of Warranties</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">
          Our tools are provided &quot;as is&quot; without any warranty. We do not guarantee that the tools will always
          work perfectly or be available at all times. Calculators and converters provide estimates for informational
          purposes only — not professional, legal, tax, or financial advice. Use at your own risk.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Limitation of Liability</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">
          {SITE.name} shall not be held liable for any damages arising from the use or inability to use our tools,
          including but not limited to data loss or file corruption.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Changes to Terms</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">
          We reserve the right to update these terms at any time. The &quot;Last updated&quot; date on this page
          reflects the most recent revision. Continued use of the site after changes constitutes acceptance of the new
          terms.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Governing Law</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">
          These terms are governed by the laws of India. Any disputes shall be resolved under Indian jurisdiction.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Contact</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">
          For questions about these terms, contact us at:{" "}
          <a href={`mailto:${SITE.email}`} className="font-medium text-primary hover:underline">
            {SITE.email}
          </a>
        </p>
        <p className="mt-3 leading-7 text-[var(--body)]">
          Also read our{" "}
          <Link href="/privacy" className="font-medium text-primary hover:underline">
            Privacy Policy →
          </Link>
        </p>
      </section>
    </article>
  );
}
