"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OCCASIONS_PATH } from "@/lib/occasions";
import { createClient } from "@/lib/supabase/client";
import { AuthButtons } from "./AuthButtons";
import { buttonClassName } from "./Button";

// Call to action on the occasion pages. They are static, so the login
// state is read in the browser: visitors get Login/Register, logged-in
// users get a back link (default: the occasions overview) and a link to
// their event list.
export function OccasionActions({ backHref = OCCASIONS_PATH }: { backHref?: string }) {
  // null = not known yet; the buttons stay invisible to avoid a flash.
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(session !== null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (loggedIn) {
    return (
      <div className="flex flex-wrap justify-center gap-2">
        <Link href={backHref} className={buttonClassName("outline")}>
          Zurück
        </Link>
        <Link href="/" className={buttonClassName("primary")}>
          Event erstellen
        </Link>
      </div>
    );
  }

  return (
    <div className={loggedIn === null ? "invisible" : undefined}>
      <AuthButtons registerLabel="Kostenlos starten" afterLoginHref="/" />
    </div>
  );
}
