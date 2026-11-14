"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("eventDialog");
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
          {t("passwortgeschutzt")}
        </label>
        <InfoTooltip label={t("wasBedeutetPasswortgeschutzt")}>
          {t.rich("passwordInfo", { b: (chunks) => <strong>{chunks}</strong> })}
        </InfoTooltip>
      </div>

      {isProtected ? (
        <div className="mt-3 space-y-3">
          <div>
            <label htmlFor={passwordId} className="mb-1 block text-sm font-semibold text-leaf-dark">
              {t("passwort")}
            </label>
            <PasswordInput
              id={passwordId}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              autoComplete="off"
              maxLength={EVENT_PASSWORD_MAX_LENGTH}
              disabled={disabled}
            />
            <p className="mt-1 text-xs text-muted">{t("mindestens4Zeichen")}</p>
          </div>
          <div>
            <label htmlFor={repeatId} className="mb-1 block text-sm font-semibold text-leaf-dark">
              {t("passwortWiederholen")}
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
