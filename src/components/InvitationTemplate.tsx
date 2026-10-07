"use client";

import { useRef, useState } from "react";
import { Button } from "./Button";
import { cardClass } from "./card";

type CopyState = "idle" | "copied" | "failed";

// Ready-to-copy invitation text of an occasion page. The text itself is
// server-rendered (crawlers read it as page content); only the copy button
// needs the client.
export function InvitationTemplate({ name, lines }: { name: string; lines: string[] }) {
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
        Einladungstext-Vorlage: {name}
      </h2>
      <p className="mt-3 text-center text-muted">
        Kopieren, Platzhalter in [eckigen Klammern] ersetzen und zusammen mit deinem Einladungslink
        verschicken.
      </p>
      <p className="mt-2 text-center text-sm text-muted">
        Noch einfacher: Legst du dein Event bei GASTZILLA an, wird der Einladungstext auf deiner
        Event-Seite automatisch mit deinen Daten und dem Link zusammengesetzt.
      </p>
      <pre
        ref={textRef}
        className="mt-6 whitespace-pre-wrap rounded-2xl border border-leaf/15 bg-[var(--surface-solid)] p-4 text-left font-sans text-muted">
        {text}
      </pre>
      <div className="mt-4 flex justify-center">
        <Button variant="outline" onClick={copy}>
          {copyState === "copied"
            ? "Kopiert!"
            : copyState === "failed"
              ? "Text ist markiert – jetzt kopieren"
              : "Text kopieren"}
        </Button>
      </div>
      <p aria-live="polite" className="sr-only">
        {copyState === "copied" ? "Einladungstext kopiert" : ""}
      </p>
    </section>
  );
}
