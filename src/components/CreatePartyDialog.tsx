"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";
import { Button } from "./Button";

type CreatePartyDialogProps = {
  onClose: () => void;
};

const THEME_KEYS = Object.keys(THEME_LABELS) as ThemeKey[];

export function CreatePartyDialog({ onClose }: CreatePartyDialogProps) {
  const router = useRouter();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (saving) return;
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("modal-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [saving, onClose]);

  async function handleSelectTheme(theme: ThemeKey) {
    if (saving) return;
    setSaving(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setSubmitError(
          payload?.error ?? "Die Party konnte nicht erstellt werden. Bitte versuche es erneut.",
        );
        setSaving(false);
        return;
      }

      const { slug } = (await response.json()) as { slug: string };
      router.push(`/p/${slug}`);
    } catch {
      setSubmitError("Die Party konnte nicht erstellt werden. Bitte versuche es erneut.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Dialog schließen"
        onClick={() => !saving && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-3xl bg-surface p-5 shadow-[var(--shadow)] sm:p-7"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label="Schließen"
          className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-leaf-dark transition hover:bg-leaf/10 disabled:opacity-50"
        >
          <CloseIcon />
        </button>

        <h2
          id={titleId}
          className="pr-8 font-[family-name:var(--font-display)] text-2xl text-leaf-dark"
        >
          Party erstellen
        </h2>
        <p className="mt-2 text-sm text-muted">Wähle ein Design für deine neue Party.</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {THEME_KEYS.map((theme) => (
            <Button
              key={theme}
              variant="outline"
              size="lg"
              onClick={() => handleSelectTheme(theme)}
              disabled={saving}
            >
              {THEME_LABELS[theme]}
            </Button>
          ))}
        </div>

        {submitError ? (
          <p className="mt-4 text-sm text-danger" role="alert">
            {submitError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
