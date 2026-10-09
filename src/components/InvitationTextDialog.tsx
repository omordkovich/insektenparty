"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import {
  buildInvitationText,
  invitationLines,
  type InvitationFacts,
  type InvitationWording,
  parseStoredWording,
  WORDING_DEFAULTS,
  WORDING_MAX_LENGTH,
  type WordingKey,
  type WordingKind,
  wordingStorageKey,
} from "@/lib/invitation-text";
import { copyToClipboard } from "@/lib/share";
import { Button } from "./Button";
import { CharCounter } from "./CharCounter";
import { MessageShareDialog } from "./MessageShareDialog";
import { ShareIcon } from "./ShareButtons";
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
  /** "dateFixed": the message after a date poll instead of the invitation. */
  kind?: WordingKind;
  onCloseAction: () => void;
};

const KIND_TEXTS: Record<
  WordingKind,
  { heading: string; intro: string; copied: string; subject: (title: string) => string }
> = {
  invitation: {
    heading: "Einladungstext",
    subject: (title) => `Einladung: ${title}`,
    intro:
      "Nur für dich sichtbar. Passe die umrandeten Felder an und schick den Text per WhatsApp, E-Mail & Co. Titel, Datum, Ort und Link kommen automatisch aus deinem Event.",
    copied: "Einladungstext kopiert",
  },
  dateFixed: {
    heading: "Termin steht fest – Gäste informieren",
    subject: (title) => `Termin steht fest: ${title}`,
    intro:
      "Schick deinen Gästen den festgelegten Termin. Passe die umrandeten Felder an – Titel, Datum, Ort und Link kommen automatisch aus deinem Event.",
    copied: "Text kopiert",
  },
};

// Owner-only overlay: an invitation text built from the event's facts and
// link (fixed) with editable wording around them, saved in this browser
// only. Event fields edited on the page flow in via the refresh
// InlineEditShell triggers after each save.
export function InvitationTextDialog({
  eventId,
  facts,
  kind = "invitation",
  onCloseAction,
}: InvitationTextDialogProps) {
  const titleId = useId();
  const texts = KIND_TEXTS[kind];
  const storageKey = wordingStorageKey(eventId, kind);
  const stored = useSyncExternalStore(
    subscribe,
    () => readStored(storageKey),
    () => null,
  );
  const wording = parseStoredWording(stored, WORDING_DEFAULTS[kind]);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
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

  // Same as sharing on the event page: the device's share sheet where there
  // is one, our own platform list otherwise - but with the whole text.
  async function handleShare() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: texts.subject(facts.title), text });
        return;
      } catch (error) {
        // Closed the share sheet - nothing to do.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    setShareDialogOpen(true);
  }

  async function handleCopy() {
    setCopyState((await copyToClipboard(text)) ? "copied" : "failed");
  }

  return (
    <Modal titleId={titleId} onCloseAction={onCloseAction}>
      <h2 id={titleId} className="pr-10 font-display text-2xl text-leaf-dark">
        {texts.heading}
      </h2>
      <p className="mt-2 text-sm text-muted">{texts.intro}</p>

      {/* No own scroll area: the dialog itself scrolls (one scrollbar), and
          the length limits keep the text short. */}
      <div className="mt-4 space-y-1.5 p-1 text-left">
        {invitationLines(facts).map((line, index) =>
          line.kind === "fixed" ? (
            <p key={`fixed-${index}`} className="break-words px-2 font-bold leading-snug text-muted">
              {line.text}
            </p>
          ) : (
            <div key={line.key}>
              <textarea
                aria-label={`${WORDING_LABELS[line.key]} bearbeiten`}
                value={wording[line.key]}
                maxLength={WORDING_MAX_LENGTH[line.key]}
                onChange={(event) => updateWording({ ...wording, [line.key]: event.target.value })}
                rows={1}
                className="field-sizing-content block w-full resize-none rounded-lg border border-leaf/30 bg-[var(--surface-solid)] px-2 py-0.5 leading-snug text-muted focus-visible:outline-2 focus-visible:outline-offset-0"
              />
              <CharCounter length={wording[line.key].length} max={WORDING_MAX_LENGTH[line.key]} />
            </div>
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
            aria-label={`${texts.heading} zum Kopieren`}
            className="mt-2 block w-full rounded-xl border border-leaf/30 bg-[var(--surface-solid)] px-3 py-2 text-sm text-muted"
          />
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => writeStored(storageKey, null)}>
          Zurücksetzen
        </Button>
        <Button variant="outline" onClick={onCloseAction}>
          Schließen
        </Button>
        <Button variant="outline" onClick={handleShare} className="gap-2">
          <ShareIcon />
          Teilen
        </Button>
        <Button variant="primary" onClick={handleCopy}>
          {copyState === "copied" ? "Kopiert!" : "Text kopieren"}
        </Button>
      </div>
      {shareDialogOpen ? (
        <MessageShareDialog
          text={text}
          url={facts.url}
          subject={texts.subject(facts.title)}
          onCloseAction={() => setShareDialogOpen(false)}
        />
      ) : null}
      <p aria-live="polite" className="sr-only">
        {copyState === "copied" ? texts.copied : ""}
      </p>
    </Modal>
  );
}
