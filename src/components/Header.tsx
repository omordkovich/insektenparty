import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { EventConfig } from "@/lib/event-config";
import type { UnlockContext } from "@/lib/products";
import type { ThemeKey } from "@/lib/theme-presets";
import { FloatingAccents } from "./FloatingAccents";
import { ThemeEditButton } from "./ThemeEditButton";

type HeaderProps = {
  config: EventConfig;
  logoHref: string;
  /** Owner only: shows the settings gear (design, password) at the logo's corner. */
  themeEdit?: {
    eventId: string;
    theme: ThemeKey;
    /** The designs this event may use (all of them for a paid event). */
    unlockedThemes: ThemeKey[];
    accessPassword: string | null;
    maxGuests: number | null;
    language: Locale;
    unlock: UnlockContext;
  };
  /** The event is over: no settings gear, whatever `themeEdit` says. */
  readOnly?: boolean;
};

export function Header({ config, logoHref, themeEdit, readOnly = false }: HeaderProps) {
  return (
    <header className="relative flex items-center justify-center overflow-hidden pt-6 pb-4">
      <FloatingAccents accentOne={config.assets.accentOne} accentTwo={config.assets.accentTwo} />

      <div className="relative">
        <Link
          href={logoHref}
          className="relative inline-block rounded-full transition-all duration-500 ease-in-out hover:scale-[1.03] hover:drop-shadow-lg hover:brightness-105 active:scale-[0.97] active:brightness-90 active:duration-150"
        >
          <Image
            src={config.assets.logo}
            alt={`${config.title} Logo`}
            width={256}
            height={256}
            className="h-auto w-64"
            priority
          />
        </Link>
        {themeEdit && !readOnly ? (
          <ThemeEditButton
            eventId={themeEdit.eventId}
            theme={themeEdit.theme}
            unlockedThemes={themeEdit.unlockedThemes}
            accessPassword={themeEdit.accessPassword}
            maxGuests={themeEdit.maxGuests}
            language={themeEdit.language}
            unlock={themeEdit.unlock}
            className="absolute bottom-2 left-full ml-3"
          />
        ) : null}
      </div>
    </header>
  );
}
