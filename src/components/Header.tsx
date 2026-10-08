import Image from "next/image";
import Link from "next/link";
import type { EventConfig } from "@/lib/event-config";
import type { ThemeKey } from "@/lib/theme-presets";
import { ThemeEditButton } from "./ThemeEditButton";

type HeaderProps = {
  config: EventConfig;
  logoHref: string;
  /** Owner only: shows the settings pencil (design, password) at the logo's corner. */
  themeEdit?: {
    eventId: string;
    theme: ThemeKey;
    unlockedThemes: ThemeKey[];
    accessPassword: string | null;
  };
};

// Logo is fixed at w-64 (256px), so half its width is a constant here.
const LOGO_HALF_WIDTH = 128;
const ACCENT_GAP = 24;
const ACCENT_OFFSET = `calc(50% + ${LOGO_HALF_WIDTH}px + ${ACCENT_GAP}px)`;
// Floating accents are shown at a fixed 110px. The size must be set
// explicitly: with "w-auto" it would follow the loaded file, and the 2x
// srcset variant (capped at the 128px source by Cloudinary's c_limit) then
// renders at half size on high-DPI screens.
const ACCENT_SIZE = 110;

export function Header({ config, logoHref, themeEdit }: HeaderProps) {
  return (
    <header className="relative flex items-center justify-center overflow-hidden pt-6 pb-4">
      {config.assets.accentOne ? (
        <Image
          src={config.assets.accentOne}
          alt=""
          width={ACCENT_SIZE}
          height={ACCENT_SIZE}
          aria-hidden="true"
          className="floating-accent animate-buzz top-1/2 h-[110px] w-[110px] -translate-y-1/2"
          style={{ right: ACCENT_OFFSET }}
          priority
        />
      ) : null}
      {config.assets.accentTwo ? (
        <Image
          src={config.assets.accentTwo}
          alt=""
          width={ACCENT_SIZE}
          height={ACCENT_SIZE}
          aria-hidden="true"
          className="floating-accent animate-float top-1/2 h-[110px] w-[110px] -translate-y-1/2"
          style={{ left: ACCENT_OFFSET }}
          priority
        />
      ) : null}

      <div className="relative">
        <Link
          href={logoHref}
          className="relative inline-block rounded-full transition-all duration-500 ease-in-out hover:scale-[1.03] hover:shadow-lg hover:brightness-105 active:scale-[0.97] active:brightness-90 active:duration-150"
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
        {themeEdit ? (
          <ThemeEditButton
            eventId={themeEdit.eventId}
            theme={themeEdit.theme}
            unlockedThemes={themeEdit.unlockedThemes}
            accessPassword={themeEdit.accessPassword}
            className="absolute bottom-2 left-full ml-3"
          />
        ) : null}
      </div>
    </header>
  );
}
