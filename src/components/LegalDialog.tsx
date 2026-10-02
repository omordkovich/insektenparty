"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { CloseIcon } from "./Modal";
import { themePortalTarget } from "./themePortalTarget";
import { useModalBehavior } from "./useModalBehavior";

type LegalDialogProps = {
  title: string;
  onCloseAction: () => void;
  children: ReactNode;
};

// Same shell as FormModal (fixed header/footer, scrolling body), just wider
// for long legal texts (Impressum, Datenschutz, AGB, Widerruf). Portalled
// out of the tree because the link that opens it can sit inside running
// text (a <p>) and inside other dialogs. On an
// event page it mounts inside the themed wrapper so it takes the event's
// theme; elsewhere it falls back to <body> and stays neutral.
export function LegalDialog({ title, onCloseAction, children }: LegalDialogProps) {
  const titleId = useId();
  const internalCloseRef = useModalBehavior({ onCloseAction });

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Dialog schließen"
        onClick={onCloseAction}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[95dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-surface p-1 shadow-(--shadow)"
      >
        <div className="shrink-0 p-5 pb-4 sm:p-7 sm:pb-4">
          <button
            ref={internalCloseRef}
            type="button"
            onClick={onCloseAction}
            aria-label="Schließen"
            className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-leaf-dark transition hover:bg-leaf/10"
          >
            <CloseIcon />
          </button>

          <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
            {title}
          </h2>
        </div>

        <div
          tabIndex={0}
          className="mr-4 min-h-0 flex-1 overflow-y-auto px-5 pb-5 text-left sm:px-7 sm:pb-7"
          style={{ scrollbarGutter: "stable" }}
        >
          {children}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 p-5 pt-3 sm:flex-row sm:justify-end sm:p-7 sm:pt-4">
          <Button variant="primary" onClick={onCloseAction}>
            Schließen
          </Button>
        </div>
      </div>
    </div>,
    themePortalTarget(),
  );
}
