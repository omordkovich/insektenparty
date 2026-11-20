import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FeedbackForm } from "@/components/FeedbackForm";
import { FeedbackNotice, FeedbackPageShell } from "@/components/FeedbackPageShell";
import { type LocaleParams, pageLocale } from "@/i18n/page-locale";
import { todayInBerlin } from "@/lib/date-poll";
import { getFeedbackPageState } from "@/services/feedback-service";

export const dynamic = "force-dynamic";

// Reached from the feedback mail after an event - nothing for search engines.
export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await pageLocale(params);
  const t = await getTranslations({ locale, namespace: "feedback" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

type FeedbackPageProps = LocaleParams & { searchParams: Promise<{ t?: string | string[] }> };

// Only reads: the review is stored by the form's POST (/api/feedback).
export default async function FeedbackPage({ params, searchParams }: FeedbackPageProps) {
  await pageLocale(params);
  const t = await getTranslations("feedback");
  const { t: raw } = await searchParams;
  const token = typeof raw === "string" ? raw : undefined;
  const state = await getFeedbackPageState(token, todayInBerlin());

  switch (state.kind) {
    case "invalid":
      return (
        <FeedbackPageShell title={t("invalidTitle")}>
          <FeedbackNotice text={t("invalidText")} />
        </FeedbackPageShell>
      );
    case "gone":
      return (
        <FeedbackPageShell title={t("goneTitle")}>
          <FeedbackNotice text={t("goneText")} />
        </FeedbackPageShell>
      );
    case "done":
      return (
        <FeedbackPageShell title={t("doneTitle")}>
          <FeedbackNotice text={t("doneText")} />
        </FeedbackPageShell>
      );
    case "form":
      return (
        <FeedbackPageShell title={t("title")}>
          <p className="mb-6 text-center text-muted">{t("intro", { title: state.title })}</p>
          <FeedbackForm token={token ?? ""} defaultName={state.ownerName ?? ""} />
        </FeedbackPageShell>
      );
  }
}
