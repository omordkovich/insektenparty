"use client";

import { useTranslations } from "next-intl";
import { useId, useRef, useState, type SubmitEvent } from "react";
import {
  NAME_MAX_LENGTH,
  PASSWORD_REQUEST_MESSAGE_MAX_LENGTH,
  PASSWORD_REQUEST_OTHER_MAX_LENGTH,
  PHONE_CHANNELS,
  validatePasswordRequest,
  type PhoneChannel,
} from "@/lib/validation";
import { Button } from "./Button";
import { CharCounter } from "./CharCounter";
import { FormModal } from "./FormModal";
import { LegalLink } from "./LegalLink";
import { RecaptchaCheckbox } from "./RecaptchaCheckbox";
import { useErrorText } from "./useErrorText";

type PasswordRequestDialogProps = {
  eventId: string;
  onCloseAction: () => void;
};

type ContactKind = "email" | "phone";

const inputClass = "w-full rounded-xl border border-leaf/25 bg-surface px-3 py-3";

// Locked event page: asks the owner for the password by e-mail. Only the
// chosen contact way is shown and sent.
export function PasswordRequestDialog({ eventId, onCloseAction }: PasswordRequestDialogProps) {
  const t = useTranslations("guestForm");
  const errorText = useErrorText();
  const titleId = useId();
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const otherId = useId();
  const messageId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [contactKind, setContactKind] = useState<ContactKind | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<PhoneChannel | null>(null);
  const [channelOther, setChannelOther] = useState("");
  const [message, setMessage] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaReset, setRecaptchaReset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  function requestClose() {
    if (!saving) onCloseAction();
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (sent) {
      onCloseAction();
      return;
    }

    const body = {
      name,
      contactKind: contactKind ?? undefined,
      ...(contactKind === "email" ? { email } : {}),
      ...(contactKind === "phone"
        ? { phone, channel: channel ?? undefined, ...(channel === "other" ? { channelOther } : {}) }
        : {}),
      message,
    };
    const validation = validatePasswordRequest(body);
    if (!validation.ok) {
      setError(errorText(validation.error));
      return;
    }
    if (!recaptchaToken) {
      setError(t("bitteBestatigeDassDu"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/password-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, recaptchaToken }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? t("dieAnfrageKonnteNicht"));
        setRecaptchaReset((value) => value + 1);
        return;
      }
      setSent(true);
    } catch {
      setError(t("dieAnfrageKonnteNicht"));
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
      initialFocusRef={sent ? undefined : nameInputRef}
      header={t("passwortAnfragen")}
      footer={
        sent ? (
          <Button variant="primary" type="submit">
            {t("schliessen")}
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={requestClose} disabled={saving}>
              {t("abbrechen")}
            </Button>
            <Button variant="primary" type="submit" disabled={saving || !recaptchaToken}>
              {saving ? t("sending") : t("sendRequest")}
            </Button>
          </>
        )
      }
    >
      {sent ? (
        <p role="status" className="text-muted">
          {t("deineAnfrageWurdeAn")}
        </p>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor={nameId} className="mb-1 block text-sm font-bold">
              {t("name")}
            </label>
            <input
              ref={nameInputRef}
              id={nameId}
              type="text"
              autoComplete="name"
              maxLength={NAME_MAX_LENGTH}
              value={name}
              disabled={saving}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
            />
          </div>

          <fieldset>
            <legend className="mb-1 block text-sm font-bold">
              {t("wieSollDirDer")}
            </legend>
            <div className="flex gap-4">
              {(["email", "phone"] as const).map((kind) => (
                <label key={kind} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="contactKind"
                    checked={contactKind === kind}
                    disabled={saving}
                    onChange={() => setContactKind(kind)}
                    className="h-5 w-5"
                  />
                  {kind === "email" ? "E-Mail" : "Telefon"}
                </label>
              ))}
            </div>
          </fieldset>

          {contactKind === "email" ? (
            <div>
              <label htmlFor={emailId} className="mb-1 block text-sm font-bold">
                {t("eMailAdresse")}
              </label>
              <input
                id={emailId}
                type="email"
                autoComplete="email"
                value={email}
                disabled={saving}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
              />
            </div>
          ) : null}

          {contactKind === "phone" ? (
            <>
              <div>
                <label htmlFor={phoneId} className="mb-1 block text-sm font-bold">
                  {t("telefonnummer")}
                </label>
                <input
                  id={phoneId}
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  disabled={saving}
                  onChange={(event) => setPhone(event.target.value)}
                  className={inputClass}
                />
              </div>
              <fieldset>
                <legend className="mb-1 block text-sm font-bold">{t("per")}</legend>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {PHONE_CHANNELS.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="channel"
                        checked={channel === option}
                        disabled={saving}
                        onChange={() => setChannel(option)}
                        className="h-5 w-5"
                      />
                      {t(`channels.${option}`)}
                    </label>
                  ))}
                </div>
              </fieldset>
              {channel === "other" ? (
                <div>
                  <label htmlFor={otherId} className="mb-1 block text-sm font-bold">
                    {t("wieGenau")}
                  </label>
                  <input
                    id={otherId}
                    type="text"
                    placeholder={t("zBSignalOder")}
                    maxLength={PASSWORD_REQUEST_OTHER_MAX_LENGTH}
                    value={channelOther}
                    disabled={saving}
                    onChange={(event) => setChannelOther(event.target.value)}
                    className={inputClass}
                  />
                </div>
              ) : null}
            </>
          ) : null}

          <div>
            <label htmlFor={messageId} className="mb-1 block text-sm font-bold">
              {t("nachricht")} <span className="font-normal text-muted">{t("optional")}</span>
            </label>
            <textarea
              id={messageId}
              rows={3}
              maxLength={PASSWORD_REQUEST_MESSAGE_MAX_LENGTH}
              value={message}
              disabled={saving}
              onChange={(event) => setMessage(event.target.value)}
              className={inputClass}
            />
            <CharCounter length={message.length} max={PASSWORD_REQUEST_MESSAGE_MAX_LENGTH} />
          </div>

          <RecaptchaCheckbox onTokenChange={setRecaptchaToken} resetSignal={recaptchaReset} />

          <p className="text-xs text-muted">
            {t.rich("requestPrivacyNote", {
              privacy: (chunks) => (
                <LegalLink document="privacy" className="underline underline-offset-2 hover:text-leaf-dark">
                  {chunks}
                </LegalLink>
              ),
            })}
          </p>

          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </FormModal>
  );
}
