import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { TitleTrustRow } from "@/components/layout/title-trust-row";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} handles privacy. Most tools process your files in your browser. Contact ${SITE.email}.`,
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-[36px] tracking-[-0.5px] sm:text-[40px]">Privacy Policy</h1>
      <p className="mt-2 text-sm text-[var(--muted-ink)]">Last updated: August 19, 2026</p>
      <p className="mt-4 leading-7 text-[var(--body)]">
        This page is maintained by the {SITE.name} team to explain how we handle data. Most of our tools process your
        files entirely in your browser — your files are not uploaded to our servers.
      </p>
      <TitleTrustRow className="mt-4" />

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Data we collect</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">
          We collect minimal anonymous usage data to improve the product. No personal information is required to use{" "}
          {SITE.name}.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Cookies</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">
          We use first-party cookies and local storage to remember preferences such as theme, favorites, and recent
          tools. If advertisements load, Google AdSense may also set third-party cookies or similar technologies to
          serve and measure ads. See Google&apos;s advertising policies for details.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Advertising</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">
          {SITE.name} uses Google AdSense to display advertisements. Google may collect data such as cookie identifiers
          and approximate location to provide and measure ads. File contents from in-browser tools are not sent to
          AdSense. This site does not currently include a consent-management platform for personalized ads in regions
          that require one (for example the EEA or UK).
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Third parties</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">
          We do not sell your data. Advertising is served by Google AdSense, which is a third party. Analytics, if
          enabled, may be provided by Google Analytics and Vercel. Those services have their own privacy policies.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Contact</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">
          Questions about privacy? Email{" "}
          <a href={`mailto:${SITE.email}`} className="font-medium text-primary hover:underline">
            {SITE.email}
          </a>
          .
        </p>
      </section>
    </article>
  );
}
