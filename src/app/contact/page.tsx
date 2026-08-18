import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TitleTrustRow } from "@/components/layout/title-trust-row";
import { GeneralContactCard, SuggestToolForm } from "@/components/contact/suggest-tool-form";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Tool Requests",
  description: `Suggest a new ${SITE.name} tool or get in touch with the team.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Contact & Tool Requests" }]} />
      <h1 className="font-display text-[36px] tracking-[-0.5px] sm:text-[48px]">Contact & Tool Requests</h1>
      <p className="mt-3 text-[var(--body)]">Have a question or want to suggest a new tool? We&apos;d love to hear from you.</p>
      <TitleTrustRow className="mt-4" />
      <div className="mt-6">
        <SuggestToolForm />
      </div>
      <GeneralContactCard />
    </div>
  );
}
