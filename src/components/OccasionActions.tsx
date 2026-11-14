"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { occasionSectionPath } from "@/lib/occasion-slugs";
import { AuthButtons } from "./AuthButtons";
import { buttonClassName } from "./Button";

// Call to action on the occasion pages. They are static, so the login
// state is read in the browser: visitors get Login/Register, logged-in
// users get a back link (default: the occasions overview) and a link to
// their event list.
export function OccasionActions({ backHref }: { backHref?: string }) {
  const t = useTranslations("occasions");
  const tHome = useTranslations("home");
  const locale = useLocale();
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
        <Link href={backHref ?? occasionSectionPath(locale)} className={buttonClassName("outline")}>
          {t("back")}
        </Link>
        <Link href="/" className={buttonClassName("primary")}>
          {t("createEvent")}
        </Link>
      </div>
    );
  }

  return (
    <div className={loggedIn === null ? "invisible" : undefined}>
      <AuthButtons registerLabel={tHome("startFree")} afterLoginHref="/" />
    </div>
  );
}
