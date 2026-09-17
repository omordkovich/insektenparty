"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { THEME_ASSETS, THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";
import { PARTY_TEXT_MAX_LENGTH } from "@/lib/validation";
import { Button } from "./Button";
import { Modal } from "./Modal";

const THEME_KEYS = Object.keys(THEME_LABELS) as ThemeKey[];

type EventDialogProps =
  | {
      mode: "create";
      onCloseAction: () => void;
    }
  | {
      mode: "edit";
      event: { id: string; title: string; theme: ThemeKey };
      onCloseAction: () => void;
      onSavedAction: (updated: { title: string; theme: ThemeKey }) => void;
    };

export function EventDialog(props: EventDialogProps) {
  const { mode, onCloseAction } = props;
  const router = useRouter();
  const titleId = useId();
  const nameFieldId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(mode === "edit" ? props.event.title : "");
  const [theme, setTheme] = useState<ThemeKey>(mode === "edit" ? props.event.theme : THEME_KEYS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      props.onSavedAction({ title: trimmedName, theme });
      onCloseAction();
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
    <Modal titleId={titleId} onCloseAction={onCloseAction} closeDisabled={saving}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
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
        placeholder="z. B. Geburtstagsfeier 2026"
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
        <Button variant="outline" onClick={onCloseAction} disabled={saving}>
          Abbrechen
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Wird gespeichert ..." : "Bestätigen"}
        </Button>
      </div>
    </Modal>
  );
}
