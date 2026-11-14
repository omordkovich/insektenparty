"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("auth");
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
        setError(body?.error ?? t("etwasIstSchiefgelaufenBitte"));
        setDeleting(false);
        onDeletingChangeAction(false);
        return;
      }
      // The session cookies are gone; re-render the start page logged out.
      router.replace("/");
      router.refresh();
    } catch {
      setError(t("etwasIstSchiefgelaufenBitte"));
      setDeleting(false);
      onDeletingChangeAction(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <p className="font-bold text-danger">
        {t("willstDuDeinKonto")}
      </p>
      <p>{t("dabeiWirdAllesGeloscht")}</p>
      <ul className="list-disc space-y-1 pl-5 text-left">
        <li>{t("deinLoginUndDeine")}</li>
        <li>{t("alleDeineEvents")}</li>
        <li>{t("alleGastelistenUndEintrage")}</li>
        <li>{t("alleFreigeschaltetenDesignsUnd")}</li>
      </ul>
      <p className="font-bold">
        {t("dasKannNichtRuckgangig")}
      </p>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancelAction} disabled={deleting}>
          {t("abbrechen")}
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? t("wirdGeloscht") : t("kontoEndgultigLoschen")}
        </Button>
      </div>
    </div>
  );
}
