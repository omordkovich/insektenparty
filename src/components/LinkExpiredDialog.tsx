"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

export type LinkExpiredKind = "signup" | "recovery";

type LinkExpiredDialogProps = {
  kind: LinkExpiredKind;
};

// Shown on the start page after /auth/confirm rejected an email link
// (?link_expired=signup|recovery). Closing it drops the query parameter so a
// reload doesn't show it again.
export function LinkExpiredDialog({ kind }: LinkExpiredDialogProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const titleId = useId();

  function close() {
    router.replace("/");
  }

  return (
    <Modal titleId={titleId} onCloseAction={close}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
        {t("derLinkFunktioniertNicht")}
      </h2>

      {kind === "signup" ? (
        <div className="mt-4 space-y-3">
          <p>
            {t("bestatigungslinksSind1Stunde")}
          </p>
          <p>
            {t("hastDuDeineE")}
          </p>
        </div>
      ) : (
        <p className="mt-4">
          {t("derLinkZumZurucksetzen")}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <Button variant="primary" onClick={close}>
          {t("schliessen")}
        </Button>
      </div>
    </Modal>
  );
}
