import Link from "next/link";
import { LegalLinks } from "./LegalLinks";
import { ShareButtons } from "./ShareButtons";

const BADGE_SRC = "https://res.cloudinary.com/d6sufegz/image/upload/v1789639601/banner_s.webp";

type MadeWithBadgeProps = {
  /** Event pages pass their share URL/title to get share + copy buttons
   *  next to the badge. */
  share?: { url: string; title: string };
};

export function MadeWithBadge({ share }: MadeWithBadgeProps) {
  return (
    <div className="mt-6 text-center">
      <div className="flex items-center justify-center gap-3">
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
        {share ? <ShareButtons url={share.url} title={share.title} className="bg-surface" /> : null}
      </div>
      <LegalLinks className="mt-2" />
    </div>
  );
}
