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
      <p className="mt-2 text-sm text-[var(--muted-ink)]">Last updated: August 17, 2026</p>
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
          We use only essential cookies and local storage to remember your preferences (theme, favorites, recent
          tools).
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-ink">Third parties</h2>
        <p className="mt-3 leading-7 text-[var(--body)]">We do not sell or share your data with third parties.</p>
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
