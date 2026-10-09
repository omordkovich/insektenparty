"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { todayInBerlin } from "@/lib/date-poll";
import { buildDateModeRequest, initialDateDraft, type DateSettings } from "@/lib/date-poll-form";
import { fixedDateFacts, type InvitationBase, type InvitationFacts } from "@/lib/invitation-text";
import { Button } from "./Button";
import { DateModeFields } from "./DateModeFields";
import { InvitationTextDialog } from "./InvitationTextDialog";
import { Modal } from "./Modal";

type DateSettingsDialogProps = {
  eventId: string;
  original: DateSettings;
  /** For the "Termin steht fest" message after fixing a poll proposal. */
  announcement: InvitationBase;
  onCloseAction: () => void;
};

// Owner's "Termin" window, opened from the pencil at the date: no date yet,
// a poll or a fixed date. Anything that would delete guests or votes is
// asked first (the server answers 409 with the counts).
export function DateSettingsDialog({ eventId, original, announcement, onCloseAction }: DateSettingsDialogProps) {
  const router = useRouter();
  const titleId = useId();
  const [draft, setDraft] = useState(() => initialDateDraft(original));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmLoss, setConfirmLoss] = useState<{ guests: number; votes: number } | null>(null);
  // Set after fixing a poll proposal: the page reloads only when this closes.
  const [fixedFacts, setFixedFacts] = useState<InvitationFacts | null>(null);

  async function handleSave(confirmed: boolean) {
    if (saving) return;

    const result = buildDateModeRequest(original, draft, todayInBerlin());
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (!result.request) {
      onCloseAction();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/date-mode`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.request, confirm: confirmed }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string; needsConfirm?: boolean; guests?: number; votes?: number }
          | null;
        if (payload?.needsConfirm) {
          setConfirmLoss({ guests: payload.guests ?? 0, votes: payload.votes ?? 0 });
        } else {
          setError(payload?.error ?? "Der Termin konnte nicht gespeichert werden. Bitte versuche es erneut.");
        }
        return;
      }
      const request = result.request;
      if (request.mode === "fixed" && request.fromOptionId) {
        setFixedFacts(fixedDateFacts(announcement, request));
        return;
      }
      // Date, guest list and poll are all server-rendered parts of the page.
      router.refresh();
      onCloseAction();
    } catch {
      setError("Der Termin konnte nicht gespeichert werden. Bitte versuche es erneut.");
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
    <Modal titleId={titleId} onCloseAction={onCloseAction} closeDisabled={saving}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
        Termin
      </h2>

      <DateModeFields
        original={original}
        draft={draft}
        onChange={(next) => {
          setDraft(next);
          setConfirmLoss(null);
          setError(null);
        }}
        disabled={saving}
      />

      {confirmLoss ? (
        <div role="alert" className="mt-4 rounded-xl border border-danger/40 bg-danger/5 p-3 text-sm">
          <p className="font-bold text-danger">Dabei wird gelöscht:</p>
          <ul className="mt-1 list-disc pl-5">
            {confirmLoss.guests > 0 ? (
              <li>
                die Gästeliste mit {confirmLoss.guests} {confirmLoss.guests === 1 ? "Eintrag" : "Einträgen"}
              </li>
            ) : null}
            {confirmLoss.votes > 0 ? (
              <li>
                {confirmLoss.votes} {confirmLoss.votes === 1 ? "Stimme" : "Stimmen"} der Terminabstimmung
              </li>
            ) : null}
          </ul>
          <p className="mt-1">Das lässt sich nicht rückgängig machen.</p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCloseAction} disabled={saving}>
          Abbrechen
        </Button>
        <Button
          variant={confirmLoss ? "danger" : "primary"}
          onClick={() => handleSave(confirmLoss !== null)}
          disabled={saving}
        >
          {saving ? "Wird gespeichert ..." : confirmLoss ? "Löschen und speichern" : "Speichern"}
        </Button>
      </div>
    </Modal>
  );
}
