"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OCCASIONS_PATH } from "@/lib/occasions";
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
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    // Imported here instead of at the top: the Supabase client is by far
    // the biggest library on these landing pages and not needed to render
    // them, so it loads after the page instead of before it.
    void import("@/lib/supabase/client").then(({ createClient }) => {
      if (cancelled) return;
      const { data } = createClient().auth.onAuthStateChange((_event, session) => {
        setLoggedIn(session !== null);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
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
