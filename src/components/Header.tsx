import Image from "next/image";
import Link from "next/link";
import type { EventConfig } from "@/lib/event-config";

type HeaderProps = {
  config: EventConfig;
  logoHref: string;
};

// Logo is fixed at w-64 (256px), so half its width is a constant here.
const LOGO_HALF_WIDTH = 128;
const ACCENT_GAP = 24;
const ACCENT_OFFSET = `calc(50% + ${LOGO_HALF_WIDTH}px + ${ACCENT_GAP}px)`;

export function Header({ config, logoHref }: HeaderProps) {
  return (
    <header className="relative flex items-center justify-center overflow-hidden pt-6 pb-4">
      <Image
        src={config.assets.accentOne}
        alt=""
        width={128}
        height={128}
        aria-hidden="true"
        className="floating-accent animate-buzz top-1/2 h-auto w-auto -translate-y-1/2"
        style={{ right: ACCENT_OFFSET }}
        priority
      />
      <Image
        src={config.assets.accentTwo}
        alt=""
        width={256}
        height={256}
        aria-hidden="true"
        className="floating-accent animate-float top-1/2 h-auto w-auto -translate-y-1/2"
        style={{ left: ACCENT_OFFSET }}
        priority
      />

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
    </header>
  );
}
