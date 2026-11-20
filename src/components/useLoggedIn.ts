"use client";

import { useEffect, useState } from "react";

// Login state on static pages (occasion and design pages), read in the
// browser. null = not known yet - callers keep their buttons invisible to
// avoid a flash.
export function useLoggedIn(): boolean | null {
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

  return loggedIn;
}
