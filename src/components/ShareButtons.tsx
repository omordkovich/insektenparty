"use client";

import { useEffect, useState, type ReactNode } from "react";
import { buildShareText, copyToClipboard } from "@/lib/share";
import { Button } from "./Button";
import { CheckIcon } from "./EditIcons";
import { ShareDialog } from "./ShareDialog";

type ShareProps = {
  url: string;
  title: string;
  /** Extra classes for the icon button - pass the same background the
   *  neighbouring edit button uses (bg-surface on event pages, bg-white in
   *  the event list), so all icon buttons in a row look identical. */
  className?: string;
};

// Share + copy, side by side (event page footer); children are extra icon
// buttons appended to the same row (e.g. the owner's invitation text).
export function ShareButtons({ children, ...props }: ShareProps & { children?: ReactNode }) {
  return (
    <div className="flex gap-2">
      <ShareButton {...props} />
      <CopyLinkButton {...props} />
      {children}
    </div>
  );
}

export function ShareButton({ url, title, className = "" }: ShareProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleShare() {
    // Native share sheet on phones and most desktop browsers - it lists
    // every installed app (WhatsApp, Signal, Instagram, ...). Browsers
    // without it get our own platform list instead.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: buildShareText(title), url });
        return;
      } catch (error) {
        // The visitor closed the share sheet - nothing to do.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    setDialogOpen(true);
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={className}
        onClick={handleShare}
        aria-label={`${title || "Event"} teilen`}
        title="Teilen"
      >
        <ShareIcon />
      </Button>
      {dialogOpen ? (
        <ShareDialog url={url} title={title} onCloseAction={() => setDialogOpen(false)} />
      ) : null}
    </>
  );
}

export function CopyLinkButton({ url, title, className = "" }: ShareProps) {
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    if (await copyToClipboard(url)) setCopied(true);
    else setDialogOpen(true); // shows the link to copy by hand
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={className}
        onClick={handleCopy}
        aria-label={copied ? "Link kopiert" : "Link kopieren"}
        title={copied ? "Link kopiert" : "Link kopieren"}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Link kopiert" : ""}
      </span>
      {dialogOpen ? (
        <ShareDialog url={url} title={title} onCloseAction={() => setDialogOpen(false)} />
      ) : null}
    </>
  );
}

export function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
