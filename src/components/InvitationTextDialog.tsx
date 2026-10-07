"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import {
  buildInvitationText,
  invitationLines,
  type InvitationFacts,
  type InvitationWording,
  parseStoredWording,
  type WordingKey,
  wordingStorageKey,
} from "@/lib/invitation-text";
import { copyToClipboard } from "@/lib/share";
import { Button } from "./Button";
import { Modal } from "./Modal";

type CopyState = "idle" | "copied" | "failed";

const WORDING_LABELS: Record<WordingKey, string> = {
  greeting: "Anrede",
  intro: "Einleitung",
  callToAction: "Aufforderung zum Eintragen",
  closing: "Gruß",
};

const WORDING_CHANGED_EVENT = "gastzilla:invitation-wording";

// Used when localStorage is blocked: edits then still work for this visit.
const memoryFallback = new Map<string, string>();

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memoryFallback.get(key) ?? null;
  }
}

function writeStored(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    if (value === null) memoryFallback.delete(key);
    else memoryFallback.set(key, value);
  }
  window.dispatchEvent(new Event(WORDING_CHANGED_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(WORDING_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(WORDING_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

type InvitationTextDialogProps = {
  eventId: string;
  facts: InvitationFacts;
  onCloseAction: () => void;
};

// Owner-only overlay: an invitation text built from the event's facts and
// link (fixed) with editable wording around them, saved in this browser
// only. Event fields edited on the page flow in via the refresh
// InlineEditShell triggers after each save.
export function InvitationTextDialog({ eventId, facts, onCloseAction }: InvitationTextDialogProps) {
  const titleId = useId();
  const storageKey = wordingStorageKey(eventId);
  const stored = useSyncExternalStore(
    subscribe,
    () => readStored(storageKey),
    () => null,
  );
  const wording = parseStoredWording(stored);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
  const text = buildInvitationText(facts, wording);

  useEffect(() => {
    if (copyState === "failed") fallbackRef.current?.select();
    if (copyState !== "copied") return;
    const timer = window.setTimeout(() => setCopyState("idle"), 2500);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  function updateWording(next: InvitationWording) {
    writeStored(storageKey, JSON.stringify(next));
  }

  async function handleCopy() {
    setCopyState((await copyToClipboard(text)) ? "copied" : "failed");
  }

  return (
    <Modal titleId={titleId} onCloseAction={onCloseAction}>
      <h2 id={titleId} className="pr-10 font-display text-2xl text-leaf-dark">
        Einladungstext
      </h2>
      <p className="mt-2 text-sm text-muted">
        Nur für dich sichtbar. Passe die umrandeten Felder an und schick den Text per WhatsApp,
        E-Mail & Co. Titel, Datum, Ort und Link kommen automatisch aus deinem Event.
      </p>

      {/* Scrolls inside the dialog so the buttons stay reachable on small screens. */}
      <div className="mt-4 max-h-[55dvh] space-y-1.5 overflow-y-auto p-1 text-left">
        {invitationLines(facts).map((line, index) =>
          line.kind === "fixed" ? (
            <p key={`fixed-${index}`} className="break-words px-2 font-bold leading-snug text-muted">
              {line.text}
            </p>
          ) : (
            <textarea
              key={line.key}
              aria-label={`${WORDING_LABELS[line.key]} bearbeiten`}
              value={wording[line.key]}
              onChange={(event) => updateWording({ ...wording, [line.key]: event.target.value })}
              rows={1}
              className="field-sizing-content block w-full resize-none rounded-lg border border-leaf/30 bg-[var(--surface-solid)] px-2 py-0.5 leading-snug text-muted focus-visible:outline-2 focus-visible:outline-offset-0"
            />
          ),
        )}
      </div>

      {copyState === "failed" ? (
        <div className="mt-4">
          <p className="text-sm text-muted">
            Kopieren wird von deinem Browser blockiert – der Text ist unten markiert, kopiere ihn von
            Hand.
          </p>
          <textarea
            ref={fallbackRef}
            readOnly
            value={text}
            rows={6}
            aria-label="Einladungstext zum Kopieren"
            className="mt-2 block w-full rounded-xl border border-leaf/30 bg-[var(--surface-solid)] px-3 py-2 text-sm text-muted"
          />
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => writeStored(storageKey, null)}>
          Zurücksetzen
        </Button>
        <Button variant="primary" onClick={handleCopy}>
          {copyState === "copied" ? "Kopiert!" : "Text kopieren"}
        </Button>
      </div>
      <p aria-live="polite" className="sr-only">
        {copyState === "copied" ? "Einladungstext kopiert" : ""}
      </p>
    </Modal>
  );
}
