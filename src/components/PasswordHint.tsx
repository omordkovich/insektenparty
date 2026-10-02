"use client";

import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { PASSWORD_SYMBOLS } from "@/lib/password";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { themePortalTarget } from "./themePortalTarget";

type PasswordHintProps = {
  id?: string;
};

// The rules for a new password (see lib/password.ts). "Sonderzeichen" opens
// a dialog listing exactly which symbols count. The dialog is portalled out
// of the surrounding form, like the other overlays opened from inside one.
export function PasswordHint({ id }: PasswordHintProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <p id={id} className="mt-1 text-xs text-muted">
        Mindestens 10 Zeichen, mit Groß- und Kleinbuchstaben, einer Ziffer und einem{" "}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="underline underline-offset-2 hover:text-leaf-dark"
        >
          Sonderzeichen
        </button>
        .
      </p>
      {open
        ? createPortal(<SymbolsDialog onCloseAction={() => setOpen(false)} />, themePortalTarget())
        : null}
    </>
  );
}

function SymbolsDialog({ onCloseAction }: { onCloseAction: () => void }) {
  const titleId = useId();

  return (
    <Modal titleId={titleId} onCloseAction={onCloseAction}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
        Erlaubte Sonderzeichen
      </h2>

      <p className="mt-3 text-sm">Diese Zeichen zählen als Sonderzeichen:</p>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Zugelassene Sonderzeichen">
        {Array.from(PASSWORD_SYMBOLS).map((symbol) => (
          <li
            key={symbol}
            className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-leaf/25 bg-surface/80 px-2 font-mono text-base font-semibold"
          >
            {symbol}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-muted">
        Leerzeichen, Umlaute (ä, ö, ü), ß sowie Zeichen wie € oder § zählen nicht als
        Sonderzeichen. Du kannst sie im Passwort verwenden, sie erfüllen diese Regel aber
        nicht.
      </p>

      <div className="mt-6 flex justify-end">
        <Button variant="primary" onClick={onCloseAction}>
          Schließen
        </Button>
      </div>
    </Modal>
  );
}
