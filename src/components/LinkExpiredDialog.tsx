"use client";

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
  const router = useRouter();
  const titleId = useId();

  function close() {
    router.replace("/");
  }

  return (
    <Modal titleId={titleId} onCloseAction={close}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
        Der Link funktioniert nicht mehr
      </h2>

      {kind === "signup" ? (
        <div className="mt-4 space-y-3">
          <p>
            Bestätigungslinks sind 1 Stunde gültig. Danach wird die unbestätigte Registrierung
            automatisch gelöscht, oder der Link wurde schon verwendet.
          </p>
          <p>
            Hast du deine E-Mail-Adresse schon bestätigt, kannst du dich einfach anmelden.
            Sonst registriere dich bitte erneut.
          </p>
        </div>
      ) : (
        <p className="mt-4">
          Der Link zum Zurücksetzen des Passworts ist abgelaufen oder wurde schon verwendet.
          Bitte fordere über „Passwort vergessen“ einen neuen an.
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <Button variant="primary" onClick={close}>
          Schließen
        </Button>
      </div>
    </Modal>
  );
}
