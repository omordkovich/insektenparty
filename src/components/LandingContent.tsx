import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { faqEntries } from "@/lib/faq";
import { siteStructuredData } from "@/lib/structured-data";
import { occasionsPath } from "@/lib/occasions";
import { AuthButtons } from "./AuthButtons";
import { cardClass } from "./card";
import { FaqSection } from "./FaqSection";
import { HowItWorks } from "./HowItWorks";
import { JsonLd } from "./JsonLd";
import { ReviewsBanner } from "./ReviewsBanner";
import { ClockIcon, GuestIcon, ShareIcon } from "./LandingIcons";

const BENEFITS: { key: "Ready" | "NoAccount" | "Share"; icon: ReactNode }[] = [
  { key: "Ready", icon: <ClockIcon /> },
  { key: "NoAccount", icon: <GuestIcon /> },
  { key: "Share", icon: <ShareIcon /> },
];

// Start page content - the part search engines index. Logged-in users pass
// their event list as `hero`, which replaces the intro section at the top.
export async function LandingContent({ hero }: { hero?: ReactNode }) {
  const locale = await getLocale();
  const t = await getTranslations("home");
  return (
    <div className="w-full max-w-3xl space-y-8">
      <JsonLd data={siteStructuredData(locale)} />
      {hero ?? (
        <section className="text-center">
          <h1 className="font-display text-3xl leading-tight text-leaf-dark sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-xl font-bold text-amber-700 sm:text-2xl">
            {t("tagline")}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            {t("intro")}
          </p>
          <div className="mt-6 flex justify-center">
            <AuthButtons registerLabel={t("startFree")} />
          </div>
        </section>
      )}

      <section aria-labelledby="benefits-title" className={cardClass}>
        <h2 id="benefits-title" className="sr-only">
          {t("benefitsTitle")}
        </h2>
        <ul className="grid gap-6 sm:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <li key={benefit.key} className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-leaf/10 text-leaf-dark">
                {benefit.icon}
              </span>
              <h3 className="mt-3 font-display text-lg text-leaf-dark">{t(`benefit${benefit.key}Title`)}</h3>
              <p className="mt-1 text-sm text-muted">{t(`benefit${benefit.key}Text`)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-sm">
          <Link href={occasionsPath(locale)} className="font-bold text-leaf-dark underline underline-offset-2">
            {t("occasionsLink")}
          </Link>
        </p>
      </section>

      <HowItWorks />

      <FaqSection items={faqEntries(locale)}>
        <p className="mt-6 text-center text-sm text-muted">
          {t("aboutLead")}{" "}
          <Link href="/about" className="font-bold text-leaf-dark underline underline-offset-2">
            {t("aboutLink")}
          </Link>
        </p>
      </FaqSection>

      <ReviewsBanner />
    </div>
  );
}
