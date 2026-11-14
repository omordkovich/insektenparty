"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useId, useState, type SubmitEvent } from "react";
import { Button } from "./Button";
import { cardClass } from "./card";
import { PasswordInput } from "./PasswordInput";
import { SiteHeader } from "./SiteHeader";

// Both open on a click only - loaded then, with their Supabase/reCAPTCHA code.
const AuthDialog = dynamic(() => import("./AuthDialog").then((m) => m.AuthDialog));
const PasswordRequestDialog = dynamic(() =>
  import("./PasswordRequestDialog").then((m) => m.PasswordRequestDialog),
);

type EventLockedPageProps = {
  eventId: string;
  title: string;
};

// Shown instead of a password-protected event to everyone who is neither
// its signed-in owner nor has unlocked it. Only the title is revealed.
export function EventLockedPage({ eventId, title }: EventLockedPageProps) {
  const t = useTranslations("event");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const passwordId = useId();
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (!password.trim()) {
      setError(t("passwordRequired"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? tErrors("eventOpenFailed"));
        return;
      }
      // The cookie is set - render the page again, now with the event.
      router.refresh();
    } catch {
      setError(tErrors("eventOpenFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SiteHeader languageSwitcher={false} />
      <main className="flex flex-col items-center px-4 pt-4 pb-16">
        <div className={`${cardClass} w-full max-w-md text-center`}>
          <h1 className="font-display text-3xl leading-tight text-leaf-dark">{t("lockedTitle", { title })}</h1>
          <p className="mt-3 text-muted">
            {t("lockedText")}
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 text-left">
            <label htmlFor={passwordId} className="mb-1 block text-sm font-bold">
              {t("passwordLabel")}
            </label>
            <PasswordInput
              id={passwordId}
              value={password}
              autoComplete="off"
              disabled={saving}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" variant="primary" className="mt-4 w-full" disabled={saving}>
              {saving ? t("checking") : t("open")}
            </Button>
          </form>

          <Button variant="outline" className="mt-3 w-full" onClick={() => setRequestOpen(true)}>
            {t("requestPassword")}
          </Button>

          <p className="mt-6 text-sm text-muted">
            {t("hostQuestion")}{" "}
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="underline underline-offset-2 hover:text-leaf-dark"
            >
              {t("signIn")}
            </button>
          </p>
        </div>
      </main>

      {requestOpen ? (
        <PasswordRequestDialog eventId={eventId} onCloseAction={() => setRequestOpen(false)} />
      ) : null}
      {/* No afterLoginHref: after login the dialog refreshes this page,
          which then renders the event for its owner. */}
      {loginOpen ? <AuthDialog initialMode="login" onCloseAction={() => setLoginOpen(false)} /> : null}
    </>
  );
}
