"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

// Shown on the start page after /auth/callback failed (?auth_error=1), e.g.
// when the Google sign-in was cancelled. Closing it drops the query parameter
// so a reload doesn't show it again.
export function AuthErrorDialog() {
  const router = useRouter();
  const titleId = useId();

  function close() {
    router.replace("/");
  }

  return (
    <Modal titleId={titleId} onCloseAction={close}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
        Anmeldung nicht abgeschlossen
      </h2>

      <p className="mt-4">
        Die Anmeldung mit Google wurde abgebrochen oder ist fehlgeschlagen. Bitte versuche es
        erneut.
      </p>

      <div className="mt-6 flex justify-end">
        <Button variant="primary" onClick={close}>
          Schließen
        </Button>
      </div>
    </Modal>
  );
}
