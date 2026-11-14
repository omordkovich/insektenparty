import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { cardClass } from "./card";
import { CalendarPlusIcon, ListCheckIcon, ShareIcon } from "./LandingIcons";

const STEPS: { key: "stepCreate" | "stepShare" | "stepTrack"; icon: ReactNode }[] = [
  { key: "stepCreate", icon: <CalendarPlusIcon /> },
  { key: "stepShare", icon: <ShareIcon /> },
  { key: "stepTrack", icon: <ListCheckIcon /> },
];

// "So funktioniert's" card - the same three steps on the start page and
// every occasion page.
export async function HowItWorks() {
  const t = await getTranslations("home");
  return (
    <section aria-labelledby="steps-title" className={cardClass}>
      <h2 id="steps-title" className="text-center font-display text-2xl text-leaf-dark sm:text-3xl">
        {t("howTitle")}
      </h2>
      <ol className="mt-6 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.key} className="flex flex-col items-center text-center">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-button-primary text-button-primary-text">
              {step.icon}
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--surface-solid)] bg-honey text-[11px] font-bold text-on-honey">
                {index + 1}
              </span>
            </span>
            <p className="mt-3 text-muted">{t(step.key)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
