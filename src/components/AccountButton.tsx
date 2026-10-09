"use client";

import { useState } from "react";
import type { SignInMethods } from "@/lib/account";
import { AccountDialog } from "./AccountDialog";

type AccountButtonProps = {
  email: string;
  name: string | null;
  methods: SignInMethods;
};

export function AccountButton({ email, name, methods }: AccountButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mein Konto"
        title="Mein Konto"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-leaf/30 bg-[var(--surface)] text-leaf-dark shadow-(--shadow) transition hover:bg-leaf/10"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M4 21c0-3.9 3.6-7 8-7s8 3.1 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <AccountDialog
          email={email}
          name={name}
          methods={methods}
          onCloseAction={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
