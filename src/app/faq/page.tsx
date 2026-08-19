import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TitleTrustRow } from "@/components/layout/title-trust-row";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = buildMetadata({
  title: "FAQ",
  description: `Common questions about ${SITE.name} — privacy, pricing, and how browser-based tools work.`,
  path: "/faq",
});

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
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
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
