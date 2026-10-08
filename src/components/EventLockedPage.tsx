"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type SubmitEvent } from "react";
import { AuthDialog } from "./AuthDialog";
import { Button } from "./Button";
import { cardClass } from "./card";
import { PasswordInput } from "./PasswordInput";
import { PasswordRequestDialog } from "./PasswordRequestDialog";
import { SiteHeader } from "./SiteHeader";

type EventLockedPageProps = {
  eventId: string;
  title: string;
};

// Shown instead of a password-protected event to everyone who is neither
// its signed-in owner nor has unlocked it. Only the title is revealed.
export function EventLockedPage({ eventId, title }: EventLockedPageProps) {
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
      setError("Bitte gib das Passwort ein.");
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
        setError(payload?.error ?? "Das Event konnte nicht geöffnet werden. Bitte versuche es erneut.");
        return;
      }
      // The cookie is set - render the page again, now with the event.
      router.refresh();
    } catch {
      setError("Das Event konnte nicht geöffnet werden. Bitte versuche es erneut.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex flex-col items-center px-4 pt-4 pb-16">
        <div className={`${cardClass} w-full max-w-md text-center`}>
          <h1 className="font-display text-3xl leading-tight text-leaf-dark">Einladung: {title}</h1>
          <p className="mt-3 text-muted">
            Dieses Event ist passwortgeschützt. Gib das Passwort ein, das du vom Gastgeber
            bekommen hast.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 text-left">
            <label htmlFor={passwordId} className="mb-1 block text-sm font-bold">
              Passwort
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
              {saving ? "Wird geprüft ..." : "Event öffnen"}
            </Button>
          </form>

          <Button variant="outline" className="mt-3 w-full" onClick={() => setRequestOpen(true)}>
            Passwort anfragen
          </Button>

          <p className="mt-6 text-sm text-muted">
            Du bist der Gastgeber?{" "}
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="underline underline-offset-2 hover:text-leaf-dark"
            >
              Anmelden
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
