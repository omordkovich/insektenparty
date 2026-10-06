import type { ReactNode } from "react";
import type { FaqItem } from "@/lib/faq";
import { cardClass } from "./card";

// "Häufige Fragen" card. The answers are plain HTML (no client JS), so
// crawlers read them even while collapsed. Pair with FAQPage schema.
export function FaqSection({ items, children }: { items: FaqItem[]; children?: ReactNode }) {
  return (
    <section aria-labelledby="faq-title" className={cardClass}>
      <h2 id="faq-title" className="text-center font-display text-2xl text-leaf-dark sm:text-3xl">
        Häufige Fragen
      </h2>
      <div className="mt-6 space-y-2 text-left">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-leaf/15 px-4 py-3 open:bg-leaf/5"
          >
            <summary className="cursor-pointer list-none font-bold text-leaf-dark marker:hidden">
              <span className="mr-2 inline-block transition group-open:rotate-90">›</span>
              {item.question}
            </summary>
            <p className="mt-2 pl-5 text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
      {children}
    </section>
  );
}
