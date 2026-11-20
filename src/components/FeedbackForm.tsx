"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useState, type FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import type { ErrorMessage } from "@/i18n/errors";
import { REVIEW_TEXT_MAX_LENGTH, REVIEW_TEXT_MIN_LENGTH, validateFeedback } from "@/lib/validation";
import { Button, buttonClassName } from "./Button";
import { LegalLink } from "./LegalLink";
import { StarRatingInput } from "./StarRatingInput";
import { useErrorText } from "./useErrorText";

type FeedbackFormProps = {
  token: string;
  defaultName: string;
};

const inputClass =
  "w-full rounded-xl border border-leaf/30 bg-[var(--surface)] px-3 py-2 text-base focus:border-leaf focus:outline-none";

// Feedback page form. Checked with the same rules as on the server
// (validateFeedback) before sending; the server answers in this language.
export function FeedbackForm({ token, defaultName }: FeedbackFormProps) {
  const t = useTranslations("feedback");
  const locale = useLocale();
  const errorText = useErrorText();
  const textId = useId();
  const nameId = useId();

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [showName, setShowName] = useState(false);
  const [name, setName] = useState(defaultName);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (sending) return;
    const fields = { rating, text, showName, name, consent };
    const checked = validateFeedback(fields);
    if (!checked.ok) {
      setError(errorText(checked.error as ErrorMessage));
      return;
    }
    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, locale, ...fields }),
      });
      if (response.ok) {
        setSent(true);
        return;
      }
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? errorText({ key: "feedbackSendFailed" }));
    } catch {
      setError(errorText({ key: "feedbackSendFailed" }));
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="font-display text-xl text-leaf-dark">{t("thanksTitle")}</h2>
        <p>{t("thanksText")}</p>
        <Link href="/" className={buttonClassName("primary")}>
          {t("homeLink")}
        </Link>
      </div>
    );
  }

  const trimmedLength = text.trim().length;
  return (
    <form onSubmit={submit} noValidate className="space-y-5 text-left">
      <StarRatingInput value={rating} onChange={setRating} disabled={sending} label={t("ratingLabel")} />

      <div>
        <label htmlFor={textId} className="mb-1 block text-sm font-bold">
          {t("textLabel")}{" "}
          <span className="font-normal text-muted">
            ({t("textHint", { min: REVIEW_TEXT_MIN_LENGTH, max: REVIEW_TEXT_MAX_LENGTH })})
          </span>
        </label>
        <textarea
          id={textId}
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={REVIEW_TEXT_MAX_LENGTH}
          rows={4}
          disabled={sending}
          className={inputClass}
        />
        <span className="mt-1 block text-right text-xs text-muted">
          {t("charsLeft", { count: Math.max(0, REVIEW_TEXT_MAX_LENGTH - trimmedLength) })}
        </span>
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={showName}
            disabled={sending}
            onChange={(event) => setShowName(event.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-leaf/40"
          />
          <span>{t("showName")}</span>
        </label>
        {showName ? (
          <div className="pl-7">
            <label htmlFor={nameId} className="mb-1 block text-sm font-bold">
              {t("nameLabel")}
            </label>
            <input
              id={nameId}
              type="text"
              autoComplete="given-name"
              value={name}
              maxLength={100}
              disabled={sending}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
            />
          </div>
        ) : null}
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          required
          checked={consent}
          disabled={sending}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-leaf/40"
        />
        <span>
          {t.rich("consent", {
            privacy: (chunks) => (
              <LegalLink document="privacy" className="underline underline-offset-2 hover:text-leaf-dark">
                {chunks}
              </LegalLink>
            ),
          })}
        </span>
      </label>

      {error ? (
        <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <p className="text-xs text-muted">{t("review")}</p>

      <Button type="submit" size="lg" disabled={sending} className="w-full">
        {sending ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
