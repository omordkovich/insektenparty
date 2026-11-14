import { useId } from "react";
import { useTranslations } from "next-intl";
import type { GuestDto } from "@/lib/types";
import { Modal } from "./Modal";

type DeclinedDetailsDialogProps = {
  guest: GuestDto;
  onCloseAction: () => void;
};

// Opened from "Abgesagt" in the guest list. A declined guest has no
// separate message button, so their message (if any) is shown here.
export function DeclinedDetailsDialog({ guest, onCloseAction }: DeclinedDetailsDialogProps) {
  const t = useTranslations("guest");
  const titleId = useId();

  return (
    <Modal titleId={titleId} onCloseAction={onCloseAction}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
        {t("declinedTitle", { name: guest.name })}
      </h2>

      {guest.hasMessage && guest.message ? (
        <>
          <p className="mt-4 text-sm font-bold text-leaf-dark">{t("nachricht2")}</p>
          <p className="mt-1 whitespace-pre-wrap">{guest.message}</p>
        </>
      ) : null}
    </Modal>
  );
}
