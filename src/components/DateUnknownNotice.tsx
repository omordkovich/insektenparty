import { useTranslations } from "next-intl";

// Status "Noch kein Termin bekannt": instead of the guest list.
export function DateUnknownNotice() {
  const t = useTranslations("event");
  return (
    <section className="page-shell py-6" aria-labelledby="date-unknown-heading">
      <div className="rounded-[2rem] border border-leaf/20 bg-[var(--surface)] p-5 text-center shadow-(--shadow) sm:p-8">
        <h2 id="date-unknown-heading" className="font-display text-3xl text-leaf-dark sm:text-4xl">
          {t("dateUnknownTitle")}
        </h2>
        <p className="mt-6 text-lg text-muted">
          {t("dateUnknownText")}
        </p>
      </div>
    </section>
  );
}
