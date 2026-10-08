"use client";

import { useId } from "react";
import { EVENT_PASSWORD_MAX_LENGTH } from "@/lib/validation";
import { InfoTooltip } from "./InfoTooltip";
import { PasswordInput } from "./PasswordInput";

type EventPasswordFieldsProps = {
  isProtected: boolean;
  onProtectedChange: (value: boolean) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  passwordRepeat: string;
  onPasswordRepeatChange: (value: string) => void;
  disabled?: boolean;
};

// "Passwortgeschützt" in the event dialog (create and settings).
export function EventPasswordFields({
  isProtected,
  onProtectedChange,
  password,
  onPasswordChange,
  passwordRepeat,
  onPasswordRepeatChange,
  disabled = false,
}: EventPasswordFieldsProps) {
  const passwordId = useId();
  const repeatId = useId();

  return (
    <div className="mt-5">
      <div className="relative flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-leaf-dark">
          <input
            type="checkbox"
            checked={isProtected}
            disabled={disabled}
            onChange={(event) => onProtectedChange(event.target.checked)}
            className="h-5 w-5 rounded border-leaf/40"
          />
          Passwortgeschützt
        </label>
        <InfoTooltip label="Was bedeutet passwortgeschützt?">
          Nur wer das Passwort kennt, sieht deine Event-Seite und die Gästeliste.{" "}
          <strong>Teile das Passwort deinen Gästen mit</strong> – am einfachsten zusammen mit dem
          Einladungslink. Im Einladungstext fügen wir es automatisch ein. Wer es nicht hat, kann
          es auf der Event-Seite bei dir anfragen; du bekommst dann eine E-Mail.
        </InfoTooltip>
      </div>

      {isProtected ? (
        <div className="mt-3 space-y-3">
          <div>
            <label htmlFor={passwordId} className="mb-1 block text-sm font-semibold text-leaf-dark">
              Passwort
            </label>
            <PasswordInput
              id={passwordId}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              autoComplete="off"
              maxLength={EVENT_PASSWORD_MAX_LENGTH}
              disabled={disabled}
            />
            <p className="mt-1 text-xs text-muted">Mindestens 4 Zeichen.</p>
          </div>
          <div>
            <label htmlFor={repeatId} className="mb-1 block text-sm font-semibold text-leaf-dark">
              Passwort wiederholen
            </label>
            <PasswordInput
              id={repeatId}
              value={passwordRepeat}
              onChange={(event) => onPasswordRepeatChange(event.target.value)}
              autoComplete="off"
              maxLength={EVENT_PASSWORD_MAX_LENGTH}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
