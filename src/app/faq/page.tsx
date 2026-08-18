import type { Metadata } from "next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TitleTrustRow } from "@/components/layout/title-trust-row";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Common questions about ${SITE.name} - privacy, pricing, and how tools work.`,
};

const FAQS = [
  {
    q: `Are ${SITE.name} tools free?`,
    a: "Yes. Essential utilities are free and do not require an account.",
  },
  {
    q: "Do you upload my files?",
    a: `${SITE.privacyNote} If a tool ever needs a server, that page will say so clearly.`,
  },
  {
    q: "Do I need to sign up?",
    a: "No. Open a tool and start.",
  },
  {
    q: "How do I search?",
    a: "Use the homepage search, the All Tools page, or press ⌘K / Ctrl+K from anywhere.",
  },
  {
    q: "What does Coming soon mean?",
    a: "The tool is in the catalog and on the roadmap. Suggest details on the Contact page if you need it sooner.",
  },
];

export default function FaqPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "FAQ" }]} />
      <h1 className="font-display text-[32px] tracking-[-0.5px] sm:text-[36px]">FAQ</h1>
      <TitleTrustRow className="mt-4" />
      <Accordion type="single" collapsible className="mt-8">
        {FAQS.map((item, index) => (
          <AccordionItem key={item.q} value={`faq-${index}`}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </article>
  );
}
