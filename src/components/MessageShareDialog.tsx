"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId } from "react";
import { buildMessageShareLinks } from "@/lib/share";
import { Modal } from "./Modal";

type MessageShareDialogProps = {
  text: string;
  url: string;
  subject: string;
  onCloseAction: () => void;
};

const platformClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-leaf/30 px-3 text-sm font-semibold transition hover:bg-leaf/10";

// Fallback for browsers without the native share sheet: sends the whole
// message (not just the link) to the platforms that take free text.
export function MessageShareDialog({ text, url, subject, onCloseAction }: MessageShareDialogProps) {
  const t = useTranslations("event");
  const titleId = useId();
  const locale = useLocale();
  const links = buildMessageShareLinks({ text, url, subject, locale });

  return (
    <Modal titleId={titleId} onCloseAction={onCloseAction}>
      <h2 id={titleId} className="pr-10 font-display text-2xl text-leaf-dark">
        {t("textTeilen")}
      </h2>
      <p className="mt-2 text-sm text-muted">{t("wahleWieDuDen")}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target={link.newTab ? "_blank" : undefined}
            rel={link.newTab ? "noopener noreferrer" : undefined}
            className={platformClass}
          >
            {link.label}
          </a>
        ))}
      </div>
    </Modal>
  );
}
