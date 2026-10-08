"use client";

import { useEffect, useState } from "react";
import { copyToClipboard } from "@/lib/share";
import { Button } from "./Button";
import { CheckIcon } from "./EditIcons";

type CopyPasswordButtonProps = {
  password: string;
  /** Same background as the neighbouring share/copy buttons. */
  className?: string;
};

// Owner-only icon button next to "Link kopieren" on a password-protected
// event: copies the event password, e.g. to send it after the link.
export function CopyPasswordButton({ password, className = "" }: CopyPasswordButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    if (await copyToClipboard(password)) setCopied(true);
    // Clipboard blocked: show the password so it can be copied by hand.
    else window.prompt("Passwort für die Event-Seite:", password);
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={className}
        onClick={handleCopy}
        aria-label={copied ? "Passwort kopiert" : "Passwort kopieren"}
        title={copied ? "Passwort kopiert" : "Passwort kopieren"}
      >
        {copied ? <CheckIcon /> : <KeyIcon />}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Passwort kopiert" : ""}
      </span>
    </>
  );
}

function KeyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="8" cy="15" r="4.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M11.2 11.8 20 3M16.5 6.5l3 3M14 9l2 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
