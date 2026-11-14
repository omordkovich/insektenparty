"use client";

import { useTranslations } from "next-intl";
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

// Message keys (namespace "auth").
const VIEW_TITLE_KEYS = {
  overview: "myAccount",
  name: "anzeigenameAndern",
  password: "passwort",
  delete: "kontoLoschen",
} as const satisfies Record<AccountView, string>;

export function AccountDialog({ email, name, methods, onCloseAction }: AccountDialogProps) {
  const t = useTranslations("auth");
  const titleId = useId();
  const [view, setView] = useState<AccountView>("overview");
  const [notice, setNotice] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function show(next: AccountView) {
    setNotice(null);
    setView(next);
  }

  const passwordTitle = methods.hasPassword ? t("passwortAndern") : t("passwortFestlegen");

  return (
    <Modal titleId={titleId} onCloseAction={onCloseAction} closeDisabled={deleting}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
        {view === "password" ? passwordTitle : t(VIEW_TITLE_KEYS[view])}
      </h2>

      {view === "overview" ? (
        <div className="mt-4 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-leaf/20 bg-white">
            <Row
              label={t("anzeigename")}
              value={name ?? "–"}
              onClick={methods.hasGoogle ? undefined : () => show("name")}
            />
            <Row label={t("email")} value={email} />
            <Row label={t("signInMethod")} value={methods.hasGoogle ? "Google" : t("email")} />
            <Row
              label={t("passwort")}
              value={methods.hasPassword ? "••••••••" : t("notSet")}
              onClick={() => show("password")}
            />
          </div>

          {methods.hasGoogle ? (
            <p className="text-sm text-foreground/60">
              {t("googleNameNote")}
            </p>
          ) : null}

          {notice ? (
            <p className="text-sm text-leaf-dark" role="status">
              {notice}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
            <Button variant="outline-danger" onClick={() => show("delete")}>
              {t("kontoLoschen")}
            </Button>
            <form action="/auth/signout" method="post" className="flex">
              <Button variant="outline" type="submit" className="w-full">
                {t("logout")}
              </Button>
            </form>
          </div>
        </div>
      ) : null}

      {view === "name" ? (
        <AccountNameForm
          currentName={name ?? ""}
          onDoneAction={() => {
            setNotice(t("nameSaved"));
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
  const t = useTranslations("auth");
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
      setError(t("etwasIstSchiefgelaufenBitte"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      {sent ? (
        <p>
          {t("passwordMailSent", { email })}
        </p>
      ) : (
        <>
          <p>
            {methods.hasPassword ? t("passwordMailChange") : t("passwordMailSet")}
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
          {sent ? t("zuruck") : t("abbrechen")}
        </Button>
        {sent ? null : (
          <Button variant="primary" onClick={handleSend} disabled={sending}>
            {sending ? t("sending") : t("sendEmail")}
          </Button>
        )}
      </div>
    </div>
  );
}
