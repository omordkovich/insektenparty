"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { THEME_ASSETS, THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";
import { PARTY_TEXT_MAX_LENGTH } from "@/lib/validation";
import { Button } from "./Button";

const THEME_KEYS = Object.keys(THEME_LABELS) as ThemeKey[];

type EventDialogProps =
  | {
      mode: "create";
      onClose: () => void;
    }
  | {
      mode: "edit";
      event: { id: string; title: string; theme: ThemeKey };
      onClose: () => void;
      onSaved: (updated: { title: string; theme: ThemeKey }) => void;
    };

export function EventDialog(props: EventDialogProps) {
  const { mode, onClose } = props;
  const router = useRouter();
  const titleId = useId();
  const nameFieldId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [name, setName] = useState(mode === "edit" ? props.event.title : "");
  const [theme, setTheme] = useState<ThemeKey>(mode === "edit" ? props.event.theme : THEME_KEYS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleSubmit() {
    if (saving) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Bitte gib einen Namen für dein Event ein.");
      nameInputRef.current?.focus();
      return;
    }
    if (trimmedName.length > PARTY_TEXT_MAX_LENGTH) {
      setError(`Name darf höchstens ${PARTY_TEXT_MAX_LENGTH} Zeichen lang sein.`);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (mode === "create") {
        const response = await fetch("/api/parties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme, title: trimmedName }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          setError(
            payload?.error ?? "Das Event konnte nicht erstellt werden. Bitte versuche es erneut.",
          );
          setSaving(false);
          return;
        }

        const { slug } = (await response.json()) as { slug: string };
        router.push(`/p/${slug}`);
        return;
      }

      const response = await fetch(`/api/parties/${props.event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, title: trimmedName }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(
          payload?.error ?? "Das Event konnte nicht gespeichert werden. Bitte versuche es erneut.",
        );
        setSaving(false);
        return;
      }

      props.onSaved({ title: trimmedName, theme });
      onClose();
    } catch {
      setError(
        mode === "create"
          ? "Das Event konnte nicht erstellt werden. Bitte versuche es erneut."
          : "Das Event konnte nicht gespeichert werden. Bitte versuche es erneut.",
      );
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
          {mode === "create" ? "Event erstellen" : "Event bearbeiten"}
        </h2>

        <label htmlFor={nameFieldId} className="mt-5 block text-sm font-semibold text-leaf-dark">
          Name
        </label>
        <input
          ref={nameInputRef}
          id={nameFieldId}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="z. B. Milans 7. Geburtstag"
          disabled={saving}
          maxLength={PARTY_TEXT_MAX_LENGTH}
          className="mt-1 w-full rounded-xl border border-leaf/25 bg-white px-3 py-2 text-zinc-800"
        />

        <p className="mt-5 text-sm font-semibold text-leaf-dark">Design</p>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {THEME_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTheme(key)}
              disabled={saving}
              aria-pressed={theme === key}
              className={`flex flex-col items-center gap-1 rounded-2xl border p-2 text-center transition ${
                theme === key ? "border-leaf bg-leaf/10" : "border-leaf/20 hover:bg-leaf/5"
              }`}
            >
              <Image
                src={THEME_ASSETS[key].logo}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <span className="text-[11px] leading-tight text-muted">{THEME_LABELS[key]}</span>
            </button>
          ))}
        </div>

        {error ? (
          <p className="mt-4 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Abbrechen
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Wird gespeichert ..." : "Bestätigen"}
          </Button>
        </div>
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
