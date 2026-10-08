"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { formatPollOptionLabel, type PollOption, type PollVoteDto } from "@/lib/date-poll";
import { Button } from "./Button";
import { Modal } from "./Modal";

type FixPollOptionDialogProps = {
  eventId: string;
  option: PollOption;
  votes: PollVoteDto[];
  onCloseAction: () => void;
};

function count(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

// Owner: "Diesen Termin festlegen" - same as choosing the proposal under
// "Fester Termin" in the event settings.
export function FixPollOptionDialog({ eventId, option, votes, onCloseAction }: FixPollOptionDialogProps) {
  const router = useRouter();
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError(payload?.error ?? "Der Termin konnte nicht festgelegt werden. Bitte versuche es erneut.");
        return;
      }
      router.refresh();
      onCloseAction();
    } catch {
      setError("Der Termin konnte nicht festgelegt werden. Bitte versuche es erneut.");
    } finally {
      setSaving(false);
    }
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
        Termin festlegen?
      </h2>
      <p className="mt-3 text-muted">
        <strong className="text-ink">{formatPollOptionLabel(option)}</strong> wird der Termin deines
        Events. {count(yes, "Zusage", "Zusagen")} und {count(no, "Absage", "Absagen")} werden in die
        Gästeliste übernommen.
        {unseen > 0
          ? ` ${count(unseen, "Person hat", "Personen haben")} diesen Termin noch nicht gesehen und ${unseen === 1 ? "wird" : "werden"} nicht übernommen.`
          : ""}{" "}
        Die Abstimmung wird beendet.
      </p>

      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button ref={cancelRef} variant="outline" onClick={onCloseAction} disabled={saving}>
          Abbrechen
        </Button>
        <Button variant="primary" onClick={handleFix} disabled={saving}>
          {saving ? "Wird festgelegt ..." : "Termin festlegen"}
        </Button>
      </div>
    </Modal>
  );
}
