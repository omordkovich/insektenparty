"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./Button";

type AccountDeleteConfirmProps = {
  onCancelAction: () => void;
  onDeletingChangeAction: (deleting: boolean) => void;
};

// Last stop before the irreversible part: spells out what is lost and only
// deletes after an explicit confirmation.
export function AccountDeleteConfirm({
  onCancelAction,
  onDeletingChangeAction,
}: AccountDeleteConfirmProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (deleting) return;

    setError(null);
    setDeleting(true);
    onDeletingChangeAction(true);
    try {
      const response = await fetch("/auth/delete-account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
        setDeleting(false);
        onDeletingChangeAction(false);
        return;
      }
      // The session cookies are gone; re-render the start page logged out.
      router.replace("/");
      router.refresh();
    } catch {
      setError("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
      setDeleting(false);
      onDeletingChangeAction(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <p className="font-bold text-danger">
        Willst du dein Konto wirklich endgültig löschen?
      </p>
      <p>Dabei wird alles gelöscht, was zu deinem Konto gehört:</p>
      <ul className="list-disc space-y-1 pl-5 text-left">
        <li>dein Login und deine Kontodaten</li>
        <li>alle deine Events</li>
        <li>alle Gästelisten und Einträge deiner Gäste</li>
        <li>alle freigeschalteten Designs und Event-Plätze</li>
      </ul>
      <p className="font-bold">
        Das kann nicht rückgängig gemacht werden. Die Einladungslinks funktionieren danach nicht
        mehr.
      </p>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancelAction} disabled={deleting}>
          Abbrechen
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Wird gelöscht ..." : "Konto endgültig löschen"}
        </Button>
      </div>
    </div>
  );
}
