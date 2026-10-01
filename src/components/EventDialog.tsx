"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { isThemeSelectable } from "@/lib/features";
import { THEME_ASSETS, THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";
import { EVENT_TEXT_MAX_LENGTH, validateNewEventTitle } from "@/lib/validation";
import { Button } from "./Button";
import { LockIcon } from "./EditIcons";
import { LegalLink } from "./LegalLink";
import { Modal } from "./Modal";

const THEME_KEYS = Object.keys(THEME_LABELS) as ThemeKey[];

type EventDialogProps =
  | {
      mode: "create";
      unlockedThemes: ThemeKey[];
      onCloseAction: () => void;
    }
  | {
      // Owner's event page: change only the design - the title is edited
      // inline on the page itself.
      mode: "theme";
      event: { id: string; theme: ThemeKey };
      unlockedThemes: ThemeKey[];
      onCloseAction: () => void;
    };

export function EventDialog(props: EventDialogProps) {
  const { mode, onCloseAction } = props;
  const router = useRouter();
  const titleId = useId();
  const nameFieldId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [theme, setTheme] = useState<ThemeKey>(mode === "theme" ? props.event.theme : THEME_KEYS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockHint, setLockHint] = useState<string | null>(null);
  const originalTheme = mode === "theme" ? props.event.theme : undefined;

  async function handleSubmit() {
    if (saving) return;

    let trimmedName = "";
    if (mode === "create") {
      const titleResult = validateNewEventTitle(name);
      if (!titleResult.ok) {
        setError(titleResult.error);
        nameInputRef.current?.focus();
        return;
      }
      trimmedName = titleResult.value;
    } else if (theme === originalTheme) {
      onCloseAction();
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (mode === "create") {
        const response = await fetch("/api/events", {
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

      const response = await fetch(`/api/events/${props.event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(
          payload?.error ?? "Das Design konnte nicht gespeichert werden. Bitte versuche es erneut.",
        );
        setSaving(false);
        return;
      }

      // The theme lives in the server-rendered layout (wrapper class,
      // assets), so re-render the page in the new design.
      router.refresh();
      onCloseAction();
    } catch {
      setError(
        mode === "create"
          ? "Das Event konnte nicht erstellt werden. Bitte versuche es erneut."
          : "Das Design konnte nicht gespeichert werden. Bitte versuche es erneut.",
      );
      setSaving(false);
    }
  }

  return (
    <Modal titleId={titleId} onCloseAction={onCloseAction} closeDisabled={saving}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
        {mode === "create" ? "Event erstellen" : "Design ändern"}
      </h2>

      {mode === "create" ? (
        <>
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
            maxLength={EVENT_TEXT_MAX_LENGTH}
            className="mt-1 w-full rounded-xl border border-leaf/25 bg-white px-3 py-2 text-zinc-800"
          />
        </>
      ) : null}

      {mode === "create" ? (
        <p className="mt-5 text-sm font-semibold text-leaf-dark">Design</p>
      ) : null}
      <div
        className={`${mode === "create" ? "mt-2" : "mt-5"} grid grid-cols-2 gap-3 sm:grid-cols-4`}
      >
        {THEME_KEYS.map((key) => {
          const selectable = isThemeSelectable(props.unlockedThemes, key, originalTheme);
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (!selectable) {
                  setLockHint("Dieses Design kannst du bald freischalten.");
                  return;
                }
                setLockHint(null);
                setTheme(key);
              }}
              disabled={saving}
              aria-pressed={theme === key}
              aria-disabled={!selectable || undefined}
              className={`relative flex flex-col items-center gap-1 rounded-2xl border p-2 text-center transition ${
                theme === key ? "border-leaf bg-leaf/10" : "border-leaf/20 hover:bg-leaf/5"
              } ${selectable ? "" : "opacity-50"}`}
            >
              {selectable ? null : (
                <span className="absolute top-1 right-1 rounded-full bg-white p-1 text-leaf-dark shadow-sm">
                  <LockIcon />
                </span>
              )}
              <Image
                src={THEME_ASSETS[key].logo}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <span className="text-[11px] leading-tight text-muted">
                {THEME_LABELS[key]}
                {selectable ? null : <span className="sr-only"> (gesperrt)</span>}
              </span>
            </button>
          );
        })}
      </div>

      {lockHint ? (
        <p className="mt-3 text-sm text-muted" role="status">
          {lockHint}
        </p>
      ) : null}

      {mode === "create" ? (
        <p className="mt-4 text-xs text-muted">
          Die Event-Seite ist für alle sichtbar, die den Einladungslink kennen –
          auch die Kontaktangaben, die du dort einträgst. Mehr dazu in der{" "}
          <LegalLink document="privacy" className="underline underline-offset-2 hover:text-leaf-dark">
            Datenschutzerklärung
          </LegalLink>
          .
        </p>
      ) : null}

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
