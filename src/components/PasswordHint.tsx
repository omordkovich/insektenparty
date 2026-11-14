"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { PASSWORD_SYMBOLS } from "@/lib/password";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { themePortalTarget } from "./themePortalTarget";

type PasswordHintProps = {
  id?: string;
};

// The rules for a new password (see lib/password.ts). "Sonderzeichen" opens
// a dialog listing exactly which symbols count. The dialog is portalled out
// of the surrounding form, like the other overlays opened from inside one.
export function PasswordHint({ id }: PasswordHintProps) {
  const t = useTranslations("auth");
  const [open, setOpen] = useState(false);

  return (
    <>
      <p id={id} className="mt-1 text-xs text-muted">
        {t.rich("passwordRules", {
          symbol: (chunks) => (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="underline underline-offset-2 hover:text-leaf-dark"
            >
              {chunks}
            </button>
          ),
        })}
      </p>
      {open
        ? createPortal(<SymbolsDialog onCloseAction={() => setOpen(false)} />, themePortalTarget())
        : null}
    </>
  );
}

function SymbolsDialog({ onCloseAction }: { onCloseAction: () => void }) {
  const t = useTranslations("auth");
  const titleId = useId();

  return (
    <Modal titleId={titleId} onCloseAction={onCloseAction}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
        {t("erlaubteSonderzeichen")}
      </h2>

      <p className="mt-3 text-sm">{t("dieseZeichenZahlenAls")}</p>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label={t("erlaubteSonderzeichen")}>
        {Array.from(PASSWORD_SYMBOLS).map((symbol) => (
          <li
            key={symbol}
            className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-leaf/25 bg-surface/80 px-2 font-mono text-base font-semibold"
          >
            {symbol}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-muted">
        {t("leerzeichenUmlauteAO")}
      </p>

      <div className="mt-6 flex justify-end">
        <Button variant="primary" onClick={onCloseAction}>
          {t("schliessen")}
        </Button>
      </div>
    </Modal>
  );
}
