import { FormEvent, useEffect, useId, useRef, useState } from "react";
import type { GuestDto } from "@/lib/types";
import {
  ARRIVAL_TIME_PATTERN,
  BRINGING_DESCRIPTION_MAX_LENGTH,
  MAX_ADDITIONAL_GUESTS,
  NAME_MAX_LENGTH,
  validateGuestInput,
} from "@/lib/validation";
import { Button } from "./Button";
import { RecaptchaCheckbox } from "./RecaptchaCheckbox";

export type GuestModalMode = "create" | "edit";

type GuestModalProps = {
  mode: GuestModalMode;
  guest: GuestDto | null;
  apiBasePath?: string;
  defaultArrivalTime?: string;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

type FormState = {
  name: string;
  additionalGuests: string;
  additionalGuestNames: string[];
  arrivalTime: string;
  bringingSomething: boolean;
  bringingDescription: string;
};

function getInitialForm(
  mode: GuestModalMode,
  guest: GuestDto | null,
  defaultArrivalTime: string,
): FormState {
  if (mode === "edit" && guest) {
    return {
      name: guest.name,
      additionalGuests: String(guest.additionalGuests),
      additionalGuestNames: guest.additionalGuestNames,
      arrivalTime: guest.arrivalTime,
      bringingSomething: guest.bringingSomething,
      bringingDescription: guest.bringingDescription ?? "",
    };
  }

  return {
    name: "",
    additionalGuests: "0",
    additionalGuestNames: [],
    arrivalTime: defaultArrivalTime,
    bringingSomething: false,
    bringingDescription: "",
  };
}

// Resizes the names array to match the (clamped) parsed count from the
// "Zusätzliche Personen" field - done directly in that field's onChange
// rather than in an effect reacting to it, so this stays a single state
// update instead of a render-then-adjust cascade.
function resizeAdditionalGuestNames(
  rawCount: string,
  currentNames: string[],
): string[] {
  const parsed = Number(rawCount);
  const target = Number.isFinite(parsed)
    ? Math.min(MAX_ADDITIONAL_GUESTS, Math.max(0, Math.trunc(parsed)))
    : 0;

  const names = currentNames.slice(0, target);
  while (names.length < target) {
    names.push(`Gast_${names.length + 1}`);
  }
  return names;
}

export function GuestModal({
  mode,
  guest,
  apiBasePath = "/api/guests",
  defaultArrivalTime = "09:00",
  onClose,
  onSaved,
}: GuestModalProps) {
  const titleId = useId();
  const nameId = useId();
  const additionalId = useId();
  const arrivalId = useId();
  const bringingId = useId();
  const bringingDescriptionId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const initialForm = getInitialForm(mode, guest, defaultArrivalTime);

  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaReset, setRecaptchaReset] = useState(0);

  const isDirty =
    form.name !== initialForm.name ||
    form.additionalGuests !== initialForm.additionalGuests ||
    form.additionalGuestNames.join("\n") !==
      initialForm.additionalGuestNames.join("\n") ||
    form.arrivalTime !== initialForm.arrivalTime ||
    form.bringingSomething !== initialForm.bringingSomething ||
    form.bringingDescription !== initialForm.bringingDescription;

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
      additionalGuestNames: form.additionalGuestNames,
      arrivalTime: form.arrivalTime,
      bringingSomething: form.bringingSomething,
      bringingDescription: form.bringingDescription,
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
        mode === "edit" && guest ? `${apiBasePath}/${guest.id}` : apiBasePath;
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
        className="relative z-10 flex max-h-[95dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-surface p-1 shadow-[var(--shadow)]"
      >
        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 p-5 pb-4 sm:p-7 sm:pb-4">
        <button
          type="button"
          onClick={requestClose}
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
          {mode === "create" ? "Gast hinzufügen" : "Gast bearbeiten"}
        </h2>
        </div>

        <div
          className="mr-4 min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-7 sm:pb-7"
          style={{ scrollbarGutter: "stable" }}
        >
        <div className="space-y-4">
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
              max={MAX_ADDITIONAL_GUESTS}
              step={1}
              value={form.additionalGuests}
              disabled={saving}
              onChange={(event) => {
                const rawValue = event.target.value;
                setForm((current) => ({
                  ...current,
                  additionalGuests: rawValue,
                  additionalGuestNames: resizeAdditionalGuestNames(
                    rawValue,
                    current.additionalGuestNames,
                  ),
                }));
              }}
              className="w-full rounded-xl border border-leaf/25 bg-white px-3 py-3"
            />
          </div>

          {form.additionalGuestNames.length > 0 ? (
            <div className="space-y-2 rounded-xl border border-leaf/15 bg-leaf/5 p-3">
              <p className="text-sm font-bold">Namen der zusätzlichen Personen</p>
              {form.additionalGuestNames.map((additionalName, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={NAME_MAX_LENGTH}
                  aria-label={`Name Gast ${index + 1}`}
                  placeholder={`Gast_${index + 1}`}
                  value={additionalName}
                  disabled={saving}
                  onChange={(event) => {
                    const value = event.target.value;
                    setForm((current) => {
                      const names = current.additionalGuestNames.slice();
                      names[index] = value;
                      return { ...current, additionalGuestNames: names };
                    });
                  }}
                  className="w-full rounded-xl border border-leaf/25 bg-white px-3 py-2"
                />
              ))}
            </div>
          ) : null}

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

          <div>
            <label className="flex items-center gap-2 text-sm font-bold">
              <input
                id={bringingId}
                name="bringingSomething"
                type="checkbox"
                checked={form.bringingSomething}
                disabled={saving}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    bringingSomething: event.target.checked,
                  }))
                }
                className="h-5 w-5 rounded border-leaf/40"
              />
              Ich bringe was mit
            </label>

            {form.bringingSomething ? (
              <input
                id={bringingDescriptionId}
                name="bringingDescription"
                type="text"
                maxLength={BRINGING_DESCRIPTION_MAX_LENGTH}
                placeholder="Was bringst du mit?"
                value={form.bringingDescription}
                disabled={saving}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    bringingDescription: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-leaf/25 bg-white px-3 py-3"
              />
            ) : null}
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
        </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 p-5 pt-3 sm:flex-row sm:justify-end sm:p-7 sm:pt-4">
          <Button variant="outline" onClick={requestClose} disabled={saving}>
            Abbrechen
          </Button>
          <Button variant="primary" type="submit" disabled={saving || !recaptchaToken}>
            {saving ? "Wird gespeichert ..." : "Bestätigen"}
          </Button>
        </div>
        </form>
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
