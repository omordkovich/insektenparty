"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { CookieSettingsDialog } from "./CookieSettingsDialog";

export function CookieSettingsLink() {
  const t = useTranslations("cookies");
  const [open, setOpen] = useState(false);

  return (
    <>
      <a
        href="#cookies"
        role="button"
        onClick={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
        className="text-sm text-muted underline underline-offset-2 hover:text-leaf-dark"
      >
        {t("link")}
      </a>
      {open ? <CookieSettingsDialog onCloseAction={() => setOpen(false)} /> : null}
    </>
  );
}
