"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Button } from "./Button";
import { cardClass } from "./card";

type CopyState = "idle" | "copied" | "failed";

// Ready-to-copy invitation text of an occasion page. The text itself is
// server-rendered (crawlers read it as page content); only the copy button
// needs the client.
export function InvitationTemplate({ name, lines }: { name: string; lines: string[] }) {
  const t = useTranslations("occasions");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const textRef = useRef<HTMLPreElement>(null);
  const text = lines.join("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
    } catch {
      // Clipboard blocked (permission, insecure context): select the text
      // instead, so Ctrl+C / "Kopieren" is all that's left to do.
      const pre = textRef.current;
      if (pre) window.getSelection()?.selectAllChildren(pre);
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 2500);
  }

  return (
    <section aria-labelledby="template-title" className={cardClass}>
      <h2 id="template-title" className="text-center font-display text-2xl text-leaf-dark sm:text-3xl">
        {t("templateTitle", { name })}
      </h2>
      <p className="mt-3 text-center text-muted">{t("templateHint")}</p>
      <p className="mt-2 text-center text-sm text-muted">{t("templateEasier")}</p>
      <pre
        ref={textRef}
        className="mt-6 whitespace-pre-wrap rounded-2xl border border-leaf/15 bg-[var(--surface-solid)] p-4 text-left font-sans text-muted">
        {text}
      </pre>
      <div className="mt-4 flex justify-center">
        <Button variant="outline" onClick={copy}>
          {copyState === "copied" ? t("copied") : copyState === "failed" ? t("copyFailed") : t("copy")}
        </Button>
      </div>
      <p aria-live="polite" className="sr-only">
        {copyState === "copied" ? t("copiedAnnouncement") : ""}
      </p>
    </section>
  );
}
