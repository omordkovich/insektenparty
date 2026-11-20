import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FeedbackActionButton } from "@/components/FeedbackActionButton";
import { FeedbackNotice, FeedbackPageShell } from "@/components/FeedbackPageShell";
import { type LocaleParams, pageLocale } from "@/i18n/page-locale";
import { isValidUnsubscribeToken } from "@/services/feedback-service";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await pageLocale(params);
  const t = await getTranslations({ locale, namespace: "feedback" });
  return { title: t("unsubscribeMetaTitle"), robots: { index: false, follow: false } };
}

type UnsubscribePageProps = LocaleParams & { searchParams: Promise<{ t?: string | string[] }> };

// "Keine Feedback-Mails mehr" from the feedback mail. The page only checks
// the link; the button's POST does the unsubscribing.
export default async function UnsubscribePage({ params, searchParams }: UnsubscribePageProps) {
  await pageLocale(params);
  const t = await getTranslations("feedback");
  const errors = await getTranslations("errors");
  const { t: raw } = await searchParams;
  const token = typeof raw === "string" ? raw : undefined;

  if (!token || !isValidUnsubscribeToken(token)) {
    return (
      <FeedbackPageShell title={t("invalidTitle")}>
        <FeedbackNotice text={errors("feedbackLinkInvalid")} />
      </FeedbackPageShell>
    );
  }
  return (
    <FeedbackPageShell title={t("unsubscribeTitle")}>
      <p className="mb-6 text-center">{t("unsubscribeText")}</p>
      <FeedbackActionButton
        url="/api/feedback/unsubscribe"
        body={{ token }}
        label={t("unsubscribeButton")}
        busyLabel={t("sending")}
        results={{ ok: `${t("unsubscribedTitle")}. ${t("unsubscribedText")}` }}
        failure={errors("feedbackLinkInvalid")}
      />
    </FeedbackPageShell>
  );
}
