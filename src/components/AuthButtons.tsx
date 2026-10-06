"use client";

import { useState } from "react";
import { AuthDialog, type AuthDialogMode } from "./AuthDialog";
import { Button } from "./Button";

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
