"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";
import { buildShareLinks, copyToClipboard, type ShareLink } from "@/lib/share";
import { Button } from "./Button";
import { Modal } from "./Modal";

type ShareDialogProps = {
  url: string;
  title: string;
  onCloseAction: () => void;
};

const platformClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-leaf/30 px-3 text-sm font-semibold transition hover:bg-leaf/10";

// Fallback for browsers without the native share sheet (e.g. Firefox on
// desktop): one plain link per platform - nothing is loaded from those
// platforms until the visitor clicks.
export function ShareDialog({ url, title, onCloseAction }: ShareDialogProps) {
  const t = useTranslations("event");
  const titleId = useId();
  const urlFieldId = useId();
  const [status, setStatus] = useState<string | null>(null);
  const locale = useLocale();
  const links = buildShareLinks({ url, title, locale });

  async function handleCopy() {
    const ok = await copyToClipboard(url);
    setStatus(ok ? t("linkCopiedDot") : t("kopierenNichtMoglichBitte"));
  }

  async function handlePlatformClick(link: ShareLink) {
    if (!link.copyFirst) return;
    const ok = await copyToClipboard(url);
    setStatus(
      ok
        ? t("linkKopiertFugeIhn", { label: link.label })
        : t("kopierenNichtMoglichBitte"),
    );
  }

  return (
    <Modal titleId={titleId} onCloseAction={onCloseAction}>
      <h2 id={titleId} className="pr-10 font-display text-2xl text-leaf-dark">
        {t("eventTeilen")}
      </h2>

      <label htmlFor={urlFieldId} className="mt-4 block text-sm font-bold">
        {t("einladungslink")}
      </label>
      <div className="mt-1 flex gap-2">
        <input
          id={urlFieldId}
          type="text"
          readOnly
          value={url}
          onFocus={(event) => event.target.select()}
          className="min-w-0 flex-1 rounded-xl border border-leaf/25 bg-surface px-3 py-2 text-sm"
        />
        <Button variant="primary" onClick={handleCopy}>
          {t("kopieren")}
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target={link.newTab ? "_blank" : undefined}
            rel={link.newTab ? "noopener noreferrer" : undefined}
            onClick={() => void handlePlatformClick(link)}
            className={platformClass}
          >
            {link.label}
          </a>
        ))}
      </div>

      <p className="mt-3 min-h-5 text-sm text-muted" role="status" aria-live="polite">
        {status}
      </p>
    </Modal>
  );
}
