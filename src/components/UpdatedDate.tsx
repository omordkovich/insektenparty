import { useLocale, useTranslations } from "next-intl";
import { INTL_FORMAT_LOCALE } from "@/i18n/config";
// "Aktualisiert am …" under a public page - a visible freshness signal for
// readers and AI assistants, matching dateModified in the page's schema.
// UTC, so the server-rendered date never shifts by a day.
export function UpdatedDate({ date, className = "" }: { date: string; className?: string }) {
  const t = useTranslations("event");
  const locale = useLocale();
  const label = new Date(`${date}T00:00:00Z`).toLocaleDateString(INTL_FORMAT_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return (
    <p className={`text-sm text-muted ${className}`}>
      {t("aktualisiertAm")} <time dateTime={date}>{label}</time>
    </p>
  );
}
