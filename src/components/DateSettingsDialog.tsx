"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { todayInBerlin, type DateMode } from "@/lib/date-poll";
import { buildDateModeRequest, dateWindowOf, initialDateDraft, type DateSettings } from "@/lib/date-poll-form";
import { dateWindowError } from "@/lib/event-plan";
import { fixedDateFacts, type InvitationBase, type InvitationFacts } from "@/lib/invitation-text";
import type { UnlockContext } from "@/lib/products";
import { Button } from "./Button";
import { DateModeFields } from "./DateModeFields";
import { InvitationTextDialog } from "./InvitationTextDialog";
import { Modal } from "./Modal";
import { UnlockDialog } from "./UnlockDialog";

type DateSettingsDialogProps = {
  eventId: string;
  original: DateSettings;
  /** For the "Termin steht fest" message after fixing a poll proposal. */
  announcement: InvitationBase;
  unlock: UnlockContext;
  onCloseAction: () => void;
};

// Owner's "Termin" window, opened from the pencil at the date: no date yet,
// a poll or a fixed date. Anything that would delete guests or votes is
// asked first (the server answers 409 with the counts).
export function DateSettingsDialog({
  eventId,
  original,
  announcement,
  unlock,
  onCloseAction,
}: DateSettingsDialogProps) {
  const router = useRouter();
  const titleId = useId();
  const [today] = useState(todayInBerlin);
  const [draft, setDraft] = useState(() => initialDateDraft(original));
  // A free event unlocked from here: usable at once, before the refreshed
  // page props (plan, maxDate) arrive. `null` = closed; the mode is the
  // locked one that was clicked (chosen right after unlocking).
  const [paidUnlocked, setPaidUnlocked] = useState(false);
  const [unlockFor, setUnlockFor] = useState<{ mode: DateMode | null } | null>(null);
  const plan = paidUnlocked ? "paid" : original.plan;
  // Until the refresh brings the paid window, the server alone checks it.
  const dateWindow = plan === original.plan ? dateWindowOf(original.plan, original.maxDate) : undefined;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmLoss, setConfirmLoss] = useState<{ guests: number; votes: number } | null>(null);
  // Set after fixing a poll proposal: the page reloads only when this closes.
  const [fixedFacts, setFixedFacts] = useState<InvitationFacts | null>(null);

  async function handleSave(confirmed: boolean) {
    if (saving) return;

    const result = buildDateModeRequest(original, draft, todayInBerlin(), dateWindow);
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
        lockedModes={plan === "free" ? ["unknown", "poll"] : undefined}
        onLockedClickAction={(mode) => setUnlockFor({ mode })}
        minDate={today}
        maxDate={dateWindow?.latest}
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
        <div className="mt-4">
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
          {plan === "free" && error === dateWindowError("free") ? (
            <Button variant="outline" className="mt-2" onClick={() => setUnlockFor({ mode: null })} disabled={saving}>
              Mehr Zeit? Event freischalten
            </Button>
          ) : null}
        </div>
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

      {unlockFor ? (
        <UnlockDialog
          kind="event"
          eventId={eventId}
          eventCredits={unlock.eventCredits}
          dummyPayments={unlock.dummyPayments}
          onCloseAction={() => setUnlockFor(null)}
          onUnlockedAction={() => {
            setPaidUnlocked(true);
            setError(null);
            if (unlockFor.mode) {
              setDraft({ ...draft, mode: unlockFor.mode });
              setConfirmLoss(null);
            }
          }}
        />
      ) : null}
    </Modal>
  );
}
