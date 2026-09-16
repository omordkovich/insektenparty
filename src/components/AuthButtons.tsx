"use client";

import { useState } from "react";
import { AuthDialog, type AuthDialogMode } from "./AuthDialog";
import { Button } from "./Button";

export function AuthButtons() {
  const [authMode, setAuthMode] = useState<AuthDialogMode | null>(null);

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setAuthMode("login")}>
          Login
        </Button>
        <Button variant="primary" onClick={() => setAuthMode("register")}>
          Registrieren
        </Button>
      </div>

      {authMode ? (
        <AuthDialog initialMode={authMode} onCloseAction={() => setAuthMode(null)} />
      ) : null}
    </>
  );
}
