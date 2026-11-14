import { useId } from "react";
import { useTranslations } from "next-intl";
import type { GuestDto } from "@/lib/types";
import { Modal } from "./Modal";

type MessageDetailsDialogProps = {
  guest: GuestDto;
  onCloseAction: () => void;
};

export function MessageDetailsDialog({ guest, onCloseAction }: MessageDetailsDialogProps) {
  const t = useTranslations("guest");
  const titleId = useId();

  return (
    <Modal titleId={titleId} onCloseAction={onCloseAction}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
        {t("nachricht2")}
      </h2>

      <p className="mt-4 whitespace-pre-wrap">{guest.message}</p>
    </Modal>
  );
}
