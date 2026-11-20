import type { Metadata } from "next";
import { FeedbackActionButton } from "@/components/FeedbackActionButton";
import { FeedbackPageShell } from "@/components/FeedbackPageShell";
import { type LocaleParams, pageLocale } from "@/i18n/page-locale";
import { stars } from "@/lib/feedback-mails";
import { getModerationState } from "@/services/feedback-service";

export const dynamic = "force-dynamic";

// Only for info@gastzilla.de (German, fixed texts), never indexed.
export const metadata: Metadata = { title: "Bewertung prüfen", robots: { index: false, follow: false } };

type ModerationPageProps = LocaleParams & {
  searchParams: Promise<{ t?: string | string[]; a?: string | string[] }>;
};

const RESULTS = {
  approved: "Gepostet – die Bewertung erscheint jetzt auf der Startseite.",
  already_approved: "Diese Bewertung war schon gepostet.",
  deleted: "Gelöscht – die Bewertung ist aus der Datenbank entfernt.",
  gone: "Diese Bewertung gibt es nicht mehr (schon gelöscht).",
};

// Opened from the buttons in the admin mail. Shows the review and asks once
// more: mail scanners open links, so only the button's POST changes anything.
export default async function ModerationPage({ params, searchParams }: ModerationPageProps) {
  await pageLocale(params);
  const { t: raw, a } = await searchParams;
  const token = typeof raw === "string" ? raw : undefined;
  const state = await getModerationState(token);

  if (state.kind !== "review" || !token) {
    return (
      <FeedbackPageShell title="Bewertung prüfen">
        <p className="text-center">
          {state.kind === "gone" ? RESULTS.gone : "Dieser Link ist ungültig."}
        </p>
      </FeedbackPageShell>
    );
  }

  const { review } = state;
  const wantsDelete = a === "delete";
  const action = (kind: "approve" | "delete") => (
    <FeedbackActionButton
      url="/api/feedback/moderate"
      body={{ token, action: kind }}
      label={kind === "approve" ? "Jetzt posten" : "Endgültig löschen"}
      busyLabel="Wird ausgeführt …"
      variant={kind === "approve" ? "primary" : "danger"}
      results={RESULTS}
      failure="Das hat nicht geklappt. Bitte später noch einmal versuchen."
    />
  );

  return (
    <FeedbackPageShell title="Bewertung prüfen">
      <div className="space-y-3">
        <p className="text-2xl text-amber-600" aria-label={`${review.rating} von 5 Sternen`}>
          {stars(review.rating)}
        </p>
        <blockquote className="rounded-xl border-l-4 border-leaf bg-leaf/5 px-4 py-3">{review.text}</blockquote>
        <p className="text-sm text-muted">
          Name: {review.displayName ?? "(ohne Namen)"} · Sprache: {review.language} · Status:{" "}
          {review.status === "approved" ? "gepostet" : "wartet auf Freigabe"}
        </p>
      </div>
      <div className="mt-6 space-y-3">
        {wantsDelete ? action("delete") : action("approve")}
        <details className="text-sm text-muted">
          <summary className="cursor-pointer">{wantsDelete ? "Doch posten?" : "Stattdessen löschen?"}</summary>
          <div className="mt-3">{wantsDelete ? action("approve") : action("delete")}</div>
        </details>
      </div>
    </FeedbackPageShell>
  );
}
