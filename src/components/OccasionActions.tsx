"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { occasionSectionPath } from "@/lib/occasion-slugs";
import { AuthButtons } from "./AuthButtons";
import { buttonClassName } from "./Button";
import { useLoggedIn } from "./useLoggedIn";

// Call to action on the occasion pages. They are static, so the login
// state is read in the browser: visitors get Login/Register, logged-in
// users get a back link (default: the occasions overview) and a link to
// their event list.
export function OccasionActions({ backHref }: { backHref?: string }) {
  const t = useTranslations("occasions");
  const tHome = useTranslations("home");
  const locale = useLocale();
  const loggedIn = useLoggedIn();

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
