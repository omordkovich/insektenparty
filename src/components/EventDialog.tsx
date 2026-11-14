"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { LOCALE_NAMES, LOCALES, type Locale } from "@/i18n/config";
import { todayInBerlin, type DateMode, type DateModeRequest } from "@/lib/date-poll";
import { buildDateModeRequest, dateWindowOf, initialDateDraft, type DateDraft } from "@/lib/date-poll-form";
import { dateWindowError, latestAllowedDate, type EventPlan } from "@/lib/event-plan";
import { isThemeSelectable, unlockedThemesFor } from "@/lib/features";
import type { UnlockContext } from "@/lib/products";
import { THEME_ASSETS, THEME_LABELS, themeLabel, type ThemeKey } from "@/lib/theme-presets";
import { MAX_GUEST_CAPACITY } from "@/lib/guest-capacity";
import {
  EVENT_TEXT_MAX_LENGTH,
  validateEventPasswordPair,
  validateMaxGuests,
  validateNewEventTitle,
} from "@/lib/validation";
import { Button } from "./Button";
import { DateModeFields } from "./DateModeFields";
import { LockIcon } from "./EditIcons";
import { EventPasswordFields } from "./EventPasswordFields";
import { LegalLink } from "./LegalLink";
import { Modal } from "./Modal";
import { UnlockDialog, type UnlockScope } from "./UnlockDialog";
import { useErrorText } from "./useErrorText";

const THEME_KEYS = Object.keys(THEME_LABELS) as ThemeKey[];

type EventDialogProps = (
  | {
      mode: "create";
      /** What the new event becomes: a free one needs a fixed date in its
       *  short window; a paid one starts without a date, as before. */
      createPlan: EventPlan;
      /** The user's own designs; a paid event gets all of them. */
      unlockedThemes: ThemeKey[];
    }
  | {
      // Owner's event page: design and password protection - the title is
      // edited inline on the page itself.
      mode: "settings";
      event: {
        id: string;
        theme: ThemeKey;
        accessPassword: string | null;
        maxGuests: number | null;
        language: Locale;
      };
      /** The designs this event may use (all of them for a paid event). */
      unlockedThemes: ThemeKey[];
    }
) & {
  unlock: UnlockContext;
  onCloseAction: () => void;
};

// A locked spot that was clicked: a design, or (create dialog) a locked
// date mode or "Mehr Zeit?" (mode null).
type UnlockTarget = { kind: "theme"; theme: ThemeKey } | { kind: "credit"; mode: DateMode | null };

export function EventDialog(props: EventDialogProps) {
  const t = useTranslations("eventDialog");
  const errorText = useErrorText();
  const { mode, onCloseAction } = props;
  const router = useRouter();
  const titleId = useId();
  const nameFieldId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const siteLocale = useLocale();
  const locale = siteLocale;
  const languageGroupId = useId();
  const originalLanguage = mode === "settings" ? props.event.language : undefined;
  const [language, setLanguage] = useState<Locale>(originalLanguage ?? siteLocale);
  const [name, setName] = useState("");
  const [theme, setTheme] = useState<ThemeKey>(mode === "settings" ? props.event.theme : THEME_KEYS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockTarget, setUnlockTarget] = useState<UnlockTarget | null>(null);
  // Unlocked from this dialog: designs bought one by one, and the whole
  // event (create: it is created as a paid event; settings: it was upgraded).
  const [boughtThemes, setBoughtThemes] = useState<ThemeKey[]>([]);
  const [paidUnlocked, setPaidUnlocked] = useState(false);
  const originalTheme = mode === "settings" ? props.event.theme : undefined;
  const originalPassword = mode === "settings" ? props.event.accessPassword : null;
  const [isProtected, setIsProtected] = useState(originalPassword !== null);
  const [password, setPassword] = useState(originalPassword ?? "");
  const [passwordRepeat, setPasswordRepeat] = useState(originalPassword ?? "");
  const maxGuestsId = useId();
  const originalMaxGuests = mode === "settings" ? props.event.maxGuests : null;
  const [limitGuests, setLimitGuests] = useState(originalMaxGuests !== null);
  const [maxGuestsInput, setMaxGuestsInput] = useState(originalMaxGuests !== null ? String(originalMaxGuests) : "");

  const createPlan: EventPlan | null =
    mode === "create" ? (paidUnlocked ? "paid" : props.createPlan) : null;
  const unlockedThemes = unlockedThemesFor(
    { unlockedThemes: [...props.unlockedThemes, ...boughtThemes] },
    paidUnlocked || createPlan === "paid" ? "paid" : "free",
  );
  // Creating a free event: the "Termin" block with "Fester Termin" preset.
  // It stays once the event is unlocked here, then with every mode.
  const withDateBlock = mode === "create" && props.createPlan === "free";
  const [today] = useState(todayInBerlin);
  const [dateDraft, setDateDraft] = useState<DateDraft>(() => ({ ...initialDateDraft(null), mode: "fixed" }));
  const dateWindow = createPlan ? dateWindowOf(createPlan, latestAllowedDate(createPlan, today)) : undefined;

  function handleUnlocked(target: UnlockTarget, scope: UnlockScope) {
    setError(null);
    if (target.kind === "theme") {
      if (scope === "theme") setBoughtThemes((current) => [...current, target.theme]);
      else setPaidUnlocked(true);
      setTheme(target.theme);
      return;
    }
    setPaidUnlocked(true);
    const unlockedMode = target.mode;
    if (unlockedMode) setDateDraft((draft) => ({ ...draft, mode: unlockedMode }));
  }

  async function handleSubmit() {
    if (saving) return;

    let trimmedName = "";
    if (mode === "create") {
      const titleResult = validateNewEventTitle(name);
      if (!titleResult.ok) {
        setError(errorText(titleResult.error));
        nameInputRef.current?.focus();
        return;
      }
      trimmedName = titleResult.value;
    }

    // A free event needs its fixed date; a paid one may start without.
    let date: DateModeRequest = { mode: "unknown" };
    if (withDateBlock) {
      const dateResult = buildDateModeRequest(null, dateDraft, todayInBerlin(), dateWindow);
      if (!dateResult.ok) {
        setError(errorText(dateResult.error));
        return;
      }
      if (dateResult.request) date = dateResult.request;
    }

    let accessPassword: string | null = null;
    if (isProtected) {
      const passwordResult = validateEventPasswordPair(password, passwordRepeat);
      if (!passwordResult.ok) {
        setError(errorText(passwordResult.error));
        return;
      }
      accessPassword = passwordResult.value;
    }

    let maxGuests: number | null = null;
    if (mode === "settings" && limitGuests) {
      const capacityResult = validateMaxGuests(maxGuestsInput);
      if (!capacityResult.ok) {
        setError(errorText(capacityResult.error));
        return;
      }
      maxGuests = capacityResult.value;
    }

    // Settings: only send what changed; nothing changed = just close.
    const changes: {
      theme?: ThemeKey;
      accessPassword?: string | null;
      maxGuests?: number | null;
      language?: Locale;
    } = {};
    if (mode === "settings") {
      if (theme !== originalTheme) changes.theme = theme;
      if (language !== originalLanguage) changes.language = language;
      if (accessPassword !== originalPassword) changes.accessPassword = accessPassword;
      if (maxGuests !== originalMaxGuests) changes.maxGuests = maxGuests;
      if (Object.keys(changes).length === 0) {
        onCloseAction();
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      if (mode === "create") {
        const response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // A paid event may start without a date ("Noch kein Termin
          // bekannt"); the owner sets it with the pencil on the event page.
          body: JSON.stringify({
            theme,
            title: trimmedName,
            accessPassword,
            date,
            paid: createPlan === "paid",
            language,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          setError(
            payload?.error ?? t("dasEventKonnteNicht2"),
          );
          setSaving(false);
          return;
        }

        const { slug } = (await response.json()) as { slug: string };
        router.push(`/event/${slug}`);
        return;
      }

      const response = await fetch(`/api/events/${props.event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(
          payload?.error ?? t("dieEinstellungenKonntenNicht"),
        );
        setSaving(false);
        return;
      }

      // Theme, password and seat limit all shape the server-rendered page
      // (wrapper class, assets, badge, invitation text, guest list).
      router.refresh();
      onCloseAction();
    } catch {
      setError(
        mode === "create"
          ? t("dasEventKonnteNicht2")
          : t("dieEinstellungenKonntenNicht"),
      );
      setSaving(false);
    }
  }

  return (
    <Modal titleId={titleId} onCloseAction={onCloseAction} closeDisabled={saving}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
        {mode === "create" ? t("eventErstellen") : t("eventEinstellungen")}
      </h2>

      {mode === "create" ? (
        <>
          <label htmlFor={nameFieldId} className="mt-5 block text-sm font-semibold text-leaf-dark">
            {t("name")}
          </label>
          <input
            ref={nameInputRef}
            id={nameFieldId}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("namePlaceholder")}
            disabled={saving}
            maxLength={EVENT_TEXT_MAX_LENGTH}
            className="mt-1 w-full rounded-xl border border-leaf/25 bg-white px-3 py-2 text-zinc-800"
          />
        </>
      ) : null}

      <p id={languageGroupId} className="mt-5 text-sm font-semibold text-leaf-dark">
        {t("language")}
      </p>
      <div role="radiogroup" aria-labelledby={languageGroupId} className="mt-2 flex flex-wrap gap-2">
        {LOCALES.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={language === option}
            lang={option}
            onClick={() => setLanguage(option)}
            disabled={saving}
            className={`min-h-11 rounded-xl border-2 px-4 text-sm font-semibold transition ${
              language === option ? "border-leaf bg-leaf/10 text-leaf-dark" : "border-leaf/20 text-zinc-700 hover:bg-leaf/5"
            }`}
          >
            {LOCALE_NAMES[option]}
          </button>
        ))}
      </div>
      <p className="mt-1 text-xs text-muted">{t("languageHint")}</p>

      <p className="mt-5 text-sm font-semibold text-leaf-dark">{t("design")}</p>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {THEME_KEYS.map((key) => {
          const selectable = isThemeSelectable(unlockedThemes, key, originalTheme);
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (!selectable) {
                  setUnlockTarget({ kind: "theme", theme: key });
                  return;
                }
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
                {themeLabel(key, locale)}
                {selectable ? null : <span className="sr-only"> {t("gesperrt")}</span>}
              </span>
            </button>
          );
        })}
      </div>

      {withDateBlock ? (
        <div className="mt-5">
          <p className="text-sm font-semibold text-leaf-dark">{t("termin")}</p>
          {createPlan === "free" ? (
            <p className="mt-1 text-xs text-muted">
              {t("deinKostenlosesEventBraucht")}
            </p>
          ) : null}
          <DateModeFields
            original={null}
            draft={dateDraft}
            onChange={(next) => {
              setDateDraft(next);
              setError(null);
            }}
            disabled={saving}
            lockedModes={createPlan === "free" ? ["unknown", "poll"] : undefined}
            onLockedClickAction={(lockedMode) => setUnlockTarget({ kind: "credit", mode: lockedMode })}
            minDate={today}
            maxDate={dateWindow?.latest}
          />
        </div>
      ) : null}

      <EventPasswordFields
        isProtected={isProtected}
        onProtectedChange={(value) => {
          setIsProtected(value);
          setError(null);
        }}
        password={password}
        onPasswordChange={setPassword}
        passwordRepeat={passwordRepeat}
        onPasswordRepeatChange={setPasswordRepeat}
        disabled={saving}
      />

      {mode === "settings" ? (
        <div className="mt-5">
          <label className="flex items-center gap-2 text-sm font-semibold text-leaf-dark">
            <input
              type="checkbox"
              checked={limitGuests}
              disabled={saving}
              onChange={(event) => {
                setLimitGuests(event.target.checked);
                setError(null);
              }}
              className="h-5 w-5 rounded border-leaf/40"
            />
            {t("teilnehmerzahlBegrenzen")}
          </label>
          {limitGuests ? (
            <div className="mt-2">
              <div className="flex items-center gap-2 text-sm">
                <label htmlFor={maxGuestsId} className="shrink-0">
                  {t("max")}
                </label>
                <input
                  id={maxGuestsId}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={MAX_GUEST_CAPACITY}
                  step={1}
                  value={maxGuestsInput}
                  disabled={saving}
                  onChange={(event) => setMaxGuestsInput(event.target.value)}
                  className="w-24 rounded-xl border border-leaf/25 bg-surface px-3 py-2"
                />
                <span>{t("personen")}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {t("begleitpersonenZahlenMitAbsagen")}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {mode === "create" ? (
        <p className="mt-4 text-xs text-muted">
          {t.rich("createPrivacyNote", {
            privacy: (chunks) => (
              <LegalLink document="privacy" className="underline underline-offset-2 hover:text-leaf-dark">
                {chunks}
              </LegalLink>
            ),
          })}
        </p>
      ) : null}

      {error ? (
        <div className="mt-4">
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
          {createPlan === "free" && error === errorText(dateWindowError("free")) ? (
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setUnlockTarget({ kind: "credit", mode: null })}
              disabled={saving}
            >
              {t("mehrZeitEventFreischalten")}
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCloseAction} disabled={saving}>
          {t("abbrechen")}
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={saving}>
          {saving ? t("saving") : t("bestatigen")}
        </Button>
      </div>

      {unlockTarget?.kind === "theme" ? (
        <UnlockDialog
          kind="theme"
          theme={unlockTarget.theme}
          // Settings: the event itself is upgraded. Create: a credit for
          // the event being created.
          eventId={mode === "settings" ? props.event.id : undefined}
          eventCredits={props.unlock.eventCredits}
          dummyPayments={props.unlock.dummyPayments}
          onCloseAction={() => setUnlockTarget(null)}
          onUnlockedAction={(scope) => handleUnlocked(unlockTarget, scope)}
        />
      ) : unlockTarget?.kind === "credit" ? (
        <UnlockDialog
          kind="credit"
          eventCredits={props.unlock.eventCredits}
          dummyPayments={props.unlock.dummyPayments}
          onCloseAction={() => setUnlockTarget(null)}
          onUnlockedAction={(scope) => handleUnlocked(unlockTarget, scope)}
        />
      ) : null}
    </Modal>
  );
}
