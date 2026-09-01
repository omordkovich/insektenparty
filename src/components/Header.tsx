import Image from "next/image";
import type { PartyConfig } from "@/lib/party-config";

type HeaderProps = {
  config: PartyConfig;
};

// Logo is fixed at w-64 (256px), so half its width is a constant here.
const LOGO_HALF_WIDTH = 128;
const ACCENT_GAP = 24;
const ACCENT_OFFSET = `calc(50% + ${LOGO_HALF_WIDTH}px + ${ACCENT_GAP}px)`;

export function Header({ config }: HeaderProps) {
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

      <Image
        src={config.assets.logo}
        alt={`${config.title} Logo`}
        width={256}
        height={256}
        className="relative h-auto w-64"
        priority
      />
    </header>
  );
}
