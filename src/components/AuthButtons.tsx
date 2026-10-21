"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { AuthDialogMode } from "./AuthDialog";
import { Button } from "./Button";

// Loaded on the first click - it pulls in the Supabase client, reCAPTCHA and
// the form validation, none of which the start page needs to render.
const AuthDialog = dynamic(() => import("./AuthDialog").then((m) => m.AuthDialog));

type AuthButtonsProps = {
  registerLabel?: string;
  // Passed on to AuthDialog: page to open after a successful login.
  afterLoginHref?: string;
};

export function AuthButtons({ registerLabel = "Registrieren", afterLoginHref }: AuthButtonsProps) {
  const [authMode, setAuthMode] = useState<AuthDialogMode | null>(null);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" onClick={() => setAuthMode("login")}>
          Login
        </Button>
        <Button variant="primary" onClick={() => setAuthMode("register")}>
          {registerLabel}
        </Button>
      </div>

      {authMode ? (
        <AuthDialog
          initialMode={authMode}
          onCloseAction={() => setAuthMode(null)}
          afterLoginHref={afterLoginHref}
        />
      ) : null}
    </>
  );
}
