import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "./Button";
import { Modal } from "./Modal";

type DeleteEventDialogProps = {
  event: { id: string; title: string };
  onCloseAction: () => void;
  onDeletedAction: () => Promise<void> | void;
};

export function DeleteEventDialog({
  event,
  onCloseAction,
  onDeletedAction,
}: DeleteEventDialogProps) {
  const t = useTranslations("eventDialog");
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (deleting) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(
          payload?.error ??
            t("dasEventKonnteNicht"),
        );
        return;
      }

      await onDeletedAction();
      onCloseAction();
    } catch {
      setError(t("dasEventKonnteNicht"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      titleId={titleId}
      descriptionId={descriptionId}
      onCloseAction={onCloseAction}
      closeDisabled={deleting}
      initialFocusRef={cancelRef}
      showCloseButton={false}
    >
      <h2 id={titleId} className="font-display text-2xl text-leaf-dark">
        {t("wirklichLoschen")}
      </h2>
      <p id={descriptionId} className="mt-3 text-muted">
        {t("deleteEventQuestion", { title: event.title })}
      </p>

      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button ref={cancelRef} variant="outline" onClick={onCloseAction} disabled={deleting}>
          {t("abbrechen")}
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? t("wirdGeloscht") : t("loschen")}
        </Button>
      </div>
    </Modal>
  );
}
