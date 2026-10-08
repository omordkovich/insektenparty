import Link from "next/link";
import type { ReactNode } from "react";
import { LegalLinks } from "./LegalLinks";
import { ShareButtons } from "./ShareButtons";

const BADGE_SRC = "https://res.cloudinary.com/d6sufegz/image/upload/v1789639601/banner_s.webp";

type MadeWithBadgeProps = {
  /** Event pages pass their share URL/title to get share + copy buttons
   *  next to the badge. */
  share?: { url: string; title: string };
  /** Extra icon button placed right of the share/copy buttons. */
  extraAction?: ReactNode;
};

export function MadeWithBadge({ share, extraAction }: MadeWithBadgeProps) {
  return (
    <div className="mt-6 text-center">
      {/* Wraps on narrow phones: the owner gets up to four icon buttons. */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="inline-block">
          {/* The badge (black on transparent) is used as a mask so it can be
              filled with the event theme's color - see .made-with-badge. */}
          <span
            role="img"
            aria-label="made with Gastzilla© 2026"
            className="made-with-badge mx-auto block aspect-[2/1] w-32"
            style={{ maskImage: `url(${BADGE_SRC})`, WebkitMaskImage: `url(${BADGE_SRC})` }}
          />
        </Link>
        {share ? (
          <ShareButtons url={share.url} title={share.title} className="bg-surface">
            {extraAction}
          </ShareButtons>
        ) : null}
      </div>
      <LegalLinks className="mt-2" />
    </div>
  );
}
