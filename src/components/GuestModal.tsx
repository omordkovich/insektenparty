import { FormEvent, useEffect, useId, useRef, useState } from "react";
import type { GuestDto } from "@/lib/types";
import {
  ARRIVAL_TIME_PATTERN,
  NAME_MAX_LENGTH,
  validateGuestInput,
} from "@/lib/validation";
import { RecaptchaCheckbox } from "./RecaptchaCheckbox";

export type GuestModalMode = "create" | "edit";

type GuestModalProps = {
  mode: GuestModalMode;
  guest: GuestDto | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

type FormState = {
  name: string;
  additionalGuests: string;
  arrivalTime: string;
};

function getInitialForm(mode: GuestModalMode, guest: GuestDto | null): FormState {
  if (mode === "edit" && guest) {
    return {
      name: guest.name,
      additionalGuests: String(guest.additionalGuests),
      arrivalTime: guest.arrivalTime,
    };
  }

  return {
    name: "",
    additionalGuests: "0",
    arrivalTime: "09:00",
  };
}

export function GuestModal({ mode, guest, onClose, onSaved }: GuestModalProps) {
  const titleId = useId();
  const nameId = useId();
  const additionalId = useId();
  const arrivalId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const initialForm = getInitialForm(mode, guest);

  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaReset, setRecaptchaReset] = useState(0);

  const isDirty =
    form.name !== initialForm.name ||
    form.additionalGuests !== initialForm.additionalGuests ||
    form.arrivalTime !== initialForm.arrivalTime;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";
    nameInputRef.current?.focus();

    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (saving) return;
      if (isDirty) {
        const confirmed = window.confirm(
          "Es gibt ungespeicherte Änderungen. Modal wirklich schließen?",
        );
        if (!confirmed) return;
      }
      onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saving, isDirty, onClose]);

  function requestClose() {
    if (saving) return;
    if (isDirty) {
      const confirmed = window.confirm(
        "Es gibt ungespeicherte Änderungen. Modal wirklich schließen?",
      );
      if (!confirmed) return;
    }
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setFieldError(null);
    setSubmitError(null);

    const parsedAdditional = Number(form.additionalGuests);
    const validation = validateGuestInput({
      name: form.name,
      additionalGuests: Number.isNaN(parsedAdditional)
        ? form.additionalGuests
        : parsedAdditional,
      arrivalTime: form.arrivalTime,
    });

    if (!validation.ok) {
      setFieldError(validation.error);
      return;
    }

    if (!ARRIVAL_TIME_PATTERN.test(validation.data.arrivalTime)) {
      setFieldError("Ankunftszeit muss im Format HH:mm angegeben werden.");
      return;
    }

    if (validation.data.name.length > NAME_MAX_LENGTH) {
      setFieldError(`Name darf höchstens ${NAME_MAX_LENGTH} Zeichen lang sein.`);
      return;
    }

    if (!recaptchaToken) {
      setFieldError("Bitte bestätige, dass du kein Roboter bist.");
      return;
    }

    setSaving(true);
    try {
      const url =
        mode === "edit" && guest ? `/api/guests/${guest.id}` : "/api/guests";
      const method = mode === "edit" ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validation.data,
          recaptchaToken,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setSubmitError(
          payload?.error ??
            "Der Gast konnte nicht gespeichert werden. Bitte versuche es erneut.",
        );
        setRecaptchaReset((value) => value + 1);
        return;
      }

      await onSaved();
      onClose();
    } catch {
      setSubmitError(
        "Der Gast konnte nicht gespeichert werden. Bitte versuche es erneut.",
      );
      setRecaptchaReset((value) => value + 1);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Dialog schließen"
        onClick={requestClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-3xl bg-surface p-5 shadow-[var(--shadow)] sm:p-7"
      >
        <h2
          id={titleId}
          className="font-[family-name:var(--font-display)] text-2xl text-leaf-dark"
        >
          {mode === "create" ? "Gast hinzufügen" : "Gast bearbeiten"}
        </h2>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor={nameId} className="mb-1 block text-sm font-bold">
              Name
            </label>
            <input
              ref={nameInputRef}
              id={nameId}
              name="name"
              type="text"
              autoComplete="name"
              maxLength={NAME_MAX_LENGTH}
              placeholder="Name des Gastes"
              value={form.name}
              disabled={saving}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="w-full rounded-xl border border-leaf/25 bg-white px-3 py-3"
            />
          </div>

          <div>
            <label htmlFor={additionalId} className="mb-1 block text-sm font-bold">
              Zusätzliche Personen
            </label>
            <input
              id={additionalId}
              name="additionalGuests"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={form.additionalGuests}
              disabled={saving}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  additionalGuests: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-leaf/25 bg-white px-3 py-3"
            />
          </div>

          <div>
            <label htmlFor={arrivalId} className="mb-1 block text-sm font-bold">
              Ankunftszeit
            </label>
            <input
              id={arrivalId}
              name="arrivalTime"
              type="time"
              value={form.arrivalTime}
              disabled={saving}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  arrivalTime: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-leaf/25 bg-white px-3 py-3"
            />
          </div>

          <RecaptchaCheckbox
            onTokenChange={setRecaptchaToken}
            resetSignal={recaptchaReset}
          />

          {fieldError || submitError ? (
            <p className="text-sm text-danger" role="alert">
              {fieldError ?? submitError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={requestClose}
              disabled={saving}
              className="min-h-11 rounded-xl border border-leaf/30 px-4 font-semibold disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={saving || !recaptchaToken}
              className="min-h-11 rounded-xl bg-leaf px-4 font-bold text-white hover:bg-leaf-dark disabled:opacity-50"
            >
              {saving ? "Wird gespeichert ..." : "Bestätigen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
