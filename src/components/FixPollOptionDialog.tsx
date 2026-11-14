"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { formatPollOptionLabel, type PollOption, type PollVoteDto } from "@/lib/date-poll";
import { fixedDateFacts, type InvitationBase, type InvitationFacts } from "@/lib/invitation-text";
import { Button } from "./Button";
import { InvitationTextDialog } from "./InvitationTextDialog";
import { Modal } from "./Modal";

type FixPollOptionDialogProps = {
  eventId: string;
  option: PollOption;
  votes: PollVoteDto[];
  /** For the "Termin steht fest" message shown right after fixing. */
  announcement: InvitationBase;
  onCloseAction: () => void;
};


// Owner: "Diesen Termin festlegen" - same as choosing the proposal under
// "Fester Termin" in the event settings.
export function FixPollOptionDialog({
  eventId,
  option,
  votes,
  announcement,
  onCloseAction,
}: FixPollOptionDialogProps) {
  const t = useTranslations("datePoll");
  const locale = useLocale();
  const router = useRouter();
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set once the date is fixed: the page reloads only when this closes.
  const [fixedFacts, setFixedFacts] = useState<InvitationFacts | null>(null);

  const answers = votes.map((vote) => vote.answers[option.id]);
  const yes = answers.filter((answer) => answer === "yes").length;
  const no = answers.filter((answer) => answer === "no").length;
  const unseen = answers.filter((answer) => answer === "unseen").length;

  async function handleFix() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/date-mode`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "fixed",
          date: option.date,
          startTime: option.startTime,
          endTime: option.endTime,
          fromOptionId: option.id,
          confirm: true,
        }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? t("derTerminKonnteNicht"));
        return;
      }
      setFixedFacts(fixedDateFacts(announcement, option, locale));
    } catch {
      setError(t("derTerminKonnteNicht"));
    } finally {
      setSaving(false);
    }
  }

  if (fixedFacts) {
    return (
      <InvitationTextDialog
        eventId={eventId}
        facts={fixedFacts}
        kind="dateFixed"
        onCloseAction={() => {
          router.refresh();
          onCloseAction();
        }}
      />
    );
  }

  return (
    <Modal
      titleId={titleId}
      onCloseAction={onCloseAction}
      closeDisabled={saving}
      initialFocusRef={cancelRef}
      showCloseButton={false}
    >
      <h2 id={titleId} className="font-display text-2xl text-leaf-dark">
        {t("terminFestlegen")}
      </h2>
      <p className="mt-3 text-muted">
        {t.rich("fixSummary", {
          option: formatPollOptionLabel(option, locale),
          yes,
          no,
          unseen,
          b: (chunks) => <strong className="text-ink">{chunks}</strong>,
        })}
      </p>

      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button ref={cancelRef} variant="outline" onClick={onCloseAction} disabled={saving}>
          {t("abbrechen")}
        </Button>
        <Button variant="primary" onClick={handleFix} disabled={saving}>
          {saving ? t("fixing") : t("terminFestlegen2")}
        </Button>
      </div>
    </Modal>
  );
}
