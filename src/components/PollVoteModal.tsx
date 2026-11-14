"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useRef, useState, type SubmitEvent } from "react";
import { formatPollOptionLabel, type PollOption, type PollVoteDto } from "@/lib/date-poll";
import { NAME_MAX_LENGTH, validatePollVote } from "@/lib/validation";
import { Button } from "./Button";
import { FormModal } from "./FormModal";
import { LegalLink } from "./LegalLink";
import { RecaptchaCheckbox } from "./RecaptchaCheckbox";
import { useErrorText } from "./useErrorText";

type PollVoteModalProps = {
  options: PollOption[];
  vote: PollVoteDto | null;
  apiBasePath: string;
  isOwner: boolean;
  onCloseAction: () => void;
  onSavedAction: () => Promise<void> | void;
};

// "Abstimmen": tick every date that works, or "Nichts davon passt".
export function PollVoteModal({
  options,
  vote,
  apiBasePath,
  isOwner,
  onCloseAction,
  onSavedAction,
}: PollVoteModalProps) {
  const locale = useLocale();
  const t = useTranslations("datePoll");
  const errorText = useErrorText();
  const titleId = useId();
  const nameId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(vote?.name ?? "");
  const [optionIds, setOptionIds] = useState<string[]>(vote?.optionIds ?? []);
  const [noneFit, setNoneFit] = useState(vote?.noneFit ?? false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaReset, setRecaptchaReset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function requestClose() {
    if (!saving) onCloseAction();
  }

  function toggleOption(id: string, checked: boolean) {
    setNoneFit(false);
    setOptionIds((current) => (checked ? [...current, id] : current.filter((other) => other !== id)));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const validation = validatePollVote(
      { name, optionIds, noneFit },
      options.map((option) => option.id),
    );
    if (!validation.ok) {
      setError(errorText(validation.error));
      return;
    }
    if (!isOwner && !recaptchaToken) {
      setError(t("bitteBestatigeDassDu"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(vote ? `${apiBasePath}/${vote.id}` : apiBasePath, {
        method: vote ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validation.value, recaptchaToken }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? t("deineStimmeKonnteNicht"));
        setRecaptchaReset((value) => value + 1);
        return;
      }
      await onSavedAction();
      onCloseAction();
    } catch {
      setError(t("deineStimmeKonnteNicht"));
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
      header={vote ? t("stimmeAndern") : "Abstimmen"}
      footer={
        <>
          <Button variant="outline" onClick={requestClose} disabled={saving}>
            {t("abbrechen")}
          </Button>
          <Button variant="primary" type="submit" disabled={saving || (!isOwner && !recaptchaToken)}>
            {saving ? t("saving") : t("auswahlBestatigen")}
          </Button>
        </>
      }
    >
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
            className="w-full rounded-xl border border-leaf/25 bg-surface px-3 py-3"
          />
        </div>

        <fieldset>
          <legend className="mb-1 block text-sm font-bold">{t("welcheTerminePassenDir")}</legend>
          <div className="space-y-2">
            {options.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={optionIds.includes(option.id)}
                  disabled={saving}
                  onChange={(event) => toggleOption(option.id, event.target.checked)}
                  className="h-5 w-5"
                />
                {formatPollOptionLabel(option, locale)}
              </label>
            ))}
            <hr className="border-leaf/15" />
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={noneFit}
                disabled={saving}
                onChange={(event) => {
                  setNoneFit(event.target.checked);
                  if (event.target.checked) setOptionIds([]);
                }}
                className="h-5 w-5"
              />
              {t("nichtsDavonPasst")}
            </label>
          </div>
        </fieldset>

        {!isOwner ? (
          <RecaptchaCheckbox onTokenChange={setRecaptchaToken} resetSignal={recaptchaReset} />
        ) : null}

        <p className="text-xs text-muted">
          {t.rich("visibilityNote", {
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
    </FormModal>
  );
}
