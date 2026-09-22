import { useId, useRef, useState, type SubmitEvent } from "react";
import type { GuestDto } from "@/lib/types";
import {
  ARRIVAL_TIME_PATTERN,
  BRINGING_DESCRIPTION_MAX_LENGTH,
  MAX_ADDITIONAL_GUESTS,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
  validateGuestInput,
} from "@/lib/validation";
import { Button } from "./Button";
import { FormModal } from "./FormModal";
import { RecaptchaCheckbox } from "./RecaptchaCheckbox";

export type GuestModalMode = "create" | "edit";

type GuestModalProps = {
  mode: GuestModalMode;
  guest: GuestDto | null;
  apiBasePath: string;
  defaultArrivalTime?: string;
  isOwner?: boolean;
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
  hasMessage: boolean;
  message: string;
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
      hasMessage: guest.hasMessage,
      message: guest.message ?? "",
    };
  }

  return {
    name: "",
    additionalGuests: "0",
    additionalGuestNames: [],
    arrivalTime: defaultArrivalTime,
    bringingSomething: false,
    bringingDescription: "",
    hasMessage: false,
    message: "",
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

function removeAdditionalGuestName(
  index: number,
  currentNames: string[],
): { additionalGuests: string; additionalGuestNames: string[] } {
  const names = currentNames.filter((_, i) => i !== index);
  return { additionalGuests: String(names.length), additionalGuestNames: names };
}

export function GuestModal({
  mode,
  guest,
  apiBasePath,
  defaultArrivalTime = "09:00",
  isOwner = false,
  onClose,
  onSaved,
}: GuestModalProps) {
  const titleId = useId();
  const nameId = useId();
  const additionalId = useId();
  const arrivalId = useId();
  const bringingId = useId();
  const bringingDescriptionId = useId();
  const messageCheckboxId = useId();
  const messageId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const initialForm = getInitialForm(mode, guest, defaultArrivalTime);

  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaReset, setRecaptchaReset] = useState(0);

  function requestClose() {
    if (saving) return;
    onClose();
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
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
      hasMessage: form.hasMessage,
      message: form.message,
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

    if (!isOwner && !recaptchaToken) {
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
    <FormModal
      titleId={titleId}
      onSubmitAction={handleSubmit}
      onCloseAction={requestClose}
      closeDisabled={saving}
      initialFocusRef={nameInputRef}
      header={mode === "create" ? "Gast hinzufügen" : "Gast bearbeiten"}
      footer={
        <>
          <Button variant="outline" onClick={requestClose} disabled={saving}>
            Abbrechen
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={saving || (!isOwner && !recaptchaToken)}
          >
            {saving ? "Wird gespeichert ..." : "Bestätigen"}
          </Button>
        </>
      }
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
              <div key={index} className="flex items-center gap-2">
                <input
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
                  className="min-w-0 flex-1 rounded-xl border border-leaf/25 bg-white px-3 py-2"
                />
                <Button
                  variant="outline-danger"
                  size="icon"
                  aria-label={`${additionalName || `Gast ${index + 1}`} entfernen`}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      ...removeAdditionalGuestName(
                        index,
                        current.additionalGuestNames,
                      ),
                    }))
                  }
                  disabled={saving}
                >
                  <TrashIcon />
                </Button>
              </div>
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

        <div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input
              id={messageCheckboxId}
              name="hasMessage"
              type="checkbox"
              checked={form.hasMessage}
              disabled={saving}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  hasMessage: event.target.checked,
                }))
              }
              className="h-5 w-5 rounded border-leaf/40"
            />
            Nachricht hinzufügen
          </label>

          {form.hasMessage ? (
            <textarea
              id={messageId}
              name="message"
              rows={3}
              maxLength={MESSAGE_MAX_LENGTH}
              placeholder="Deine Nachricht"
              value={form.message}
              disabled={saving}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-leaf/25 bg-white px-3 py-3"
            />
          ) : null}
        </div>

        {!isOwner ? (
          <RecaptchaCheckbox onTokenChange={setRecaptchaToken} resetSignal={recaptchaReset} />
        ) : null}

        {fieldError || submitError ? (
          <p className="text-sm text-danger" role="alert">
            {fieldError ?? submitError}
          </p>
        ) : null}
      </div>
    </FormModal>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 7h14M10 11v6M14 11v6M9 7V5h6v2M7 7l1 12h8l1-12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
