"use client";

import { useEffect, useId, useRef } from "react";
import type { GuestDto } from "@/lib/types";

type AdditionalGuestsDialogProps = {
  guest: GuestDto;
  onClose: () => void;
};

export function AdditionalGuestsDialog({ guest, onClose }: AdditionalGuestsDialogProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("modal-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Dialog schließen"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-3xl bg-surface p-5 shadow-[var(--shadow)] sm:p-7"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-leaf-dark transition hover:bg-leaf/10"
        >
          <CloseIcon />
        </button>

        <h2
          id={titleId}
          className="pr-8 font-[family-name:var(--font-display)] text-2xl text-leaf-dark"
        >
          Zusätzliche Personen
        </h2>

        <ul className="mt-4 space-y-2">
          {guest.additionalGuestNames.map((additionalName, index) => (
            <li
              key={index}
              className="rounded-xl border border-leaf/15 bg-white/80 px-3 py-2"
            >
              {additionalName}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
