"use client";

import { useId, useState } from "react";
import type { SignInMethods } from "@/lib/account";
import { createClient } from "@/lib/supabase/client";
import { AccountDeleteConfirm } from "./AccountDeleteConfirm";
import { AccountNameForm } from "./AccountNameForm";
import { Button } from "./Button";
import { Modal } from "./Modal";

type AccountView = "overview" | "name" | "password" | "delete";

type AccountDialogProps = {
  email: string;
  name: string | null;
  methods: SignInMethods;
  onCloseAction: () => void;
};

const VIEW_TITLES: Record<AccountView, string> = {
  overview: "Mein Konto",
  name: "Anzeigename ändern",
  password: "Passwort",
  delete: "Konto löschen",
};

export function AccountDialog({ email, name, methods, onCloseAction }: AccountDialogProps) {
  const titleId = useId();
  const [view, setView] = useState<AccountView>("overview");
  const [notice, setNotice] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function show(next: AccountView) {
    setNotice(null);
    setView(next);
  }

  const passwordTitle = methods.hasPassword ? "Passwort ändern" : "Passwort festlegen";

  return (
    <Modal titleId={titleId} onCloseAction={onCloseAction} closeDisabled={deleting}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
        {view === "password" ? passwordTitle : VIEW_TITLES[view]}
      </h2>

      {view === "overview" ? (
        <div className="mt-4 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-leaf/20 bg-white">
            <Row label="Anzeigename" value={name ?? "–"} onClick={() => show("name")} />
            <Row label="E-Mail" value={email} />
            <Row label="Anmeldung" value={methods.hasGoogle ? "Google" : "E-Mail"} />
            <Row
              label="Passwort"
              value={methods.hasPassword ? "••••••••" : "Nicht festgelegt"}
              onClick={() => show("password")}
            />
          </div>

          {notice ? (
            <p className="text-sm text-leaf-dark" role="status">
              {notice}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
            <Button variant="outline-danger" onClick={() => show("delete")}>
              Konto löschen
            </Button>
            <form action="/auth/signout" method="post" className="flex">
              <Button variant="outline" type="submit" className="w-full">
                Logout
              </Button>
            </form>
          </div>
        </div>
      ) : null}

      {view === "name" ? (
        <AccountNameForm
          currentName={name ?? ""}
          onDoneAction={() => {
            setNotice("Anzeigename gespeichert.");
            setView("overview");
          }}
          onCancelAction={() => show("overview")}
        />
      ) : null}

      {view === "password" ? (
        <PasswordView email={email} methods={methods} onBackAction={() => show("overview")} />
      ) : null}

      {view === "delete" ? (
        <AccountDeleteConfirm
          onCancelAction={() => show("overview")}
          onDeletingChangeAction={setDeleting}
        />
      ) : null}
    </Modal>
  );
}

// One key/value line of the overview: key left, value right. With `onClick`
// the whole line is a button (value + chevron), otherwise it is plain text.
function Row({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  const content = (
    <>
      <span className="shrink-0 text-sm font-bold text-foreground/60">{label}</span>
      <span className="flex min-w-0 items-center gap-1.5">
        <span className={`truncate text-right ${onClick ? "text-leaf-dark" : ""}`}>{value}</span>
        {onClick ? <ChevronIcon /> : null}
      </span>
    </>
  );
  const rowClass =
    "flex w-full items-center justify-between gap-4 border-b border-leaf/15 px-4 py-3 last:border-b-0";

  if (!onClick) return <div className={rowClass}>{content}</div>;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${rowClass} text-left transition hover:bg-leaf/10 focus-visible:bg-leaf/10`}
    >
      {content}
    </button>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-leaf"
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Same flow as "Passwort vergessen": a mail with a link to /auth/reset-password.
// For a Google-only account this adds the password login.
function PasswordView({
  email,
  methods,
  onBackAction,
}: {
  email: string;
  methods: SignInMethods;
  onBackAction: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (sending) return;

    setError(null);
    setSending(true);
    try {
      const { error: resetError } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
    } catch {
      setError("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      {sent ? (
        <p>
          Wir haben dir eine E-Mail an {email} geschickt. Über den Link darin kannst du ein neues
          Passwort vergeben.
        </p>
      ) : (
        <>
          <p>
            Wir schicken dir eine E-Mail mit einem Link, über den du{" "}
            {methods.hasPassword ? "ein neues Passwort" : "ein Passwort"} festlegst.
            {methods.hasPassword
              ? ""
              : " Du kannst dich danach zusätzlich zu Google auch mit E-Mail und Passwort anmelden."}
          </p>
          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onBackAction} disabled={sending}>
          {sent ? "Zurück" : "Abbrechen"}
        </Button>
        {sent ? null : (
          <Button variant="primary" onClick={handleSend} disabled={sending}>
            {sending ? "Wird gesendet ..." : "E-Mail senden"}
          </Button>
        )}
      </div>
    </div>
  );
}
