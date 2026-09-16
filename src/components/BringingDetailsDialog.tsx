import { useId } from "react";
import type { GuestDto } from "@/lib/types";
import { Modal } from "./Modal";

type BringingDetailsDialogProps = {
  guest: GuestDto;
  onCloseAction: () => void;
};

export function BringingDetailsDialog({ guest, onCloseAction }: BringingDetailsDialogProps) {
  const titleId = useId();

  return (
    <Modal titleId={titleId} onCloseAction={onCloseAction}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
        Ich bringe folgende Sachen mit:
      </h2>

      <p className="mt-4 whitespace-pre-wrap">{guest.bringingDescription}</p>
    </Modal>
  );
}
