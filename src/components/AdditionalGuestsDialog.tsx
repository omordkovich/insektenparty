"use client";

import { useId } from "react";
import type { GuestDto } from "@/lib/types";
import { Modal } from "./Modal";

type AdditionalGuestsDialogProps = {
  guest: GuestDto;
  onCloseAction: () => void;
};

export function AdditionalGuestsDialog({ guest, onCloseAction }: AdditionalGuestsDialogProps) {
  const titleId = useId();

  return (
    <Modal titleId={titleId} onCloseAction={onCloseAction}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
        Zusätzliche Personen
      </h2>

      <ul className="mt-4 space-y-2">
        {guest.additionalGuestNames.map((additionalName, index) => (
          <li key={index} className="rounded-xl border border-leaf/15 bg-white/80 px-3 py-2">
            {additionalName}
          </li>
        ))}
      </ul>
    </Modal>
  );
}
