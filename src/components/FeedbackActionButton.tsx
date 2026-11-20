"use client";

import { useState } from "react";
import { Button, type ButtonVariant } from "./Button";

type FeedbackActionButtonProps = {
  url: string;
  body: Record<string, string>;
  label: string;
  busyLabel: string;
  variant?: ButtonVariant;
  // Text shown after the request, by the server's `result` (or "ok").
  results: Record<string, string>;
  failure: string;
};

// The one step that changes something on the moderation / unsubscribe pages:
// a POST from a real button, so a mail scanner opening the link does nothing.
export function FeedbackActionButton({
  url,
  body,
  label,
  busyLabel,
  variant = "primary",
  results,
  failure,
}: FeedbackActionButtonProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => null)) as { result?: string; error?: string } | null;
      if (!response.ok) {
        setMessage(data?.error ?? failure);
        return;
      }
      setMessage(results[data?.result ?? "ok"] ?? results.ok ?? failure);
    } catch {
      setMessage(failure);
    } finally {
      setBusy(false);
    }
  }

  if (message) {
    return (
      <p role="status" className="rounded-xl bg-leaf/10 px-3 py-2 text-center">
        {message}
      </p>
    );
  }
  return (
    <Button type="button" size="lg" variant={variant} disabled={busy} onClick={run} className="w-full">
      {busy ? busyLabel : label}
    </Button>
  );
}
