import type { ToolSeoRecord } from "@/config/tools";
import { SITE } from "@/lib/site";

export function ToolSeoContent({
  seo,
  localFirst = true,
}: {
  seo: ToolSeoRecord;
  localFirst?: boolean;
}) {
  return (
    <div className="mt-10 space-y-10">
      <section>
        <h2 className="font-display text-[22px] tracking-[-0.3px]">How to use {seo.h1}</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-[15px] leading-[1.65] text-[var(--body)]">
          {seo.howToSteps.map((item) => (
            <li key={item.step}>
              <span className="font-medium text-ink">{item.step}.</span> {item.text}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="font-display text-[22px] tracking-[-0.3px]">Key features &amp; privacy</h2>
        <div className="mt-4 space-y-3 text-[15px] leading-[1.65] text-[var(--body)]">
          {localFirst ? (
            <p>
              {seo.h1} is built for in-browser use on {SITE.name}. Work stays on this device whenever the tool runs
              locally — there is no account wall and no file inbox on our servers.
            </p>
          ) : (
            <p>
              {seo.h1} is free to use on {SITE.name}. Review the tool notes if a step needs a network request, and
              avoid sensitive files when you are unsure.
            </p>
          )}
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Runs in modern browsers with JavaScript and HTML5.</li>
            <li>No signup required to get a result.</li>
            <li>Zero-upload policy on local-first tools — close the tab and the working copy is gone.</li>
            <li>Shareable, indexable URL so you can return to the same utility later.</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="font-display text-[22px] tracking-[-0.3px]">Frequently asked questions</h2>
        <div className="mt-4 divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
          {seo.faqs.map((faq) => (
            <details key={faq.question} className="py-4">
              <summary className="cursor-pointer font-display text-[18px] font-medium leading-snug tracking-[-0.02em] text-ink">
                {faq.question}
              </summary>
              <p className="mt-3 text-[15px] leading-[1.65] text-[var(--body)]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
