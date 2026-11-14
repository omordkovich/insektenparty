import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

type SiteHeaderProps = {
  /** Shown in the top right corner next to the language menu (the account button). */
  action?: ReactNode;
  /** Event pages always use the event's language - no menu there. */
  languageSwitcher?: boolean;
};

// Sync (useTranslations) so client pages like EventLockedPage can render it too.
export function SiteHeader({ action, languageSwitcher = true }: SiteHeaderProps) {
  const t = useTranslations("header");
  const hasCorner = languageSwitcher || action;
  return (
    <header className="relative flex justify-center p-4">
      <Link href="/" aria-label={t("homeLabel")}>
        <Image
          src="https://res.cloudinary.com/d6sufegz/image/upload/v1789641286/banner_l.webp"
          alt="GASTZILLA"
          width={256}
          height={91}
          className="h-auto w-64"
          priority
        />
      </Link>
      {hasCorner ? (
        // Phones: stacked, so both buttons fit beside the centred logo.
        <div className="absolute right-3 top-3 flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          {languageSwitcher ? <LanguageSwitcher signedIn={Boolean(action)} /> : null}
          {action}
        </div>
      ) : null}
    </header>
  );
}
