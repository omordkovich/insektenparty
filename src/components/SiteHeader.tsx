import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

// `action` is shown in the top right corner (e.g. the account button).
export function SiteHeader({ action }: { action?: ReactNode }) {
  return (
    <header className="relative flex justify-center p-4">
      <Link href="/" aria-label="GASTZILLA – zur Startseite">
        <Image
          src="https://res.cloudinary.com/d6sufegz/image/upload/v1789641286/banner_l.webp"
          alt="GASTZILLA"
          width={256}
          height={91}
          className="h-auto w-64"
          priority
        />
      </Link>
      {action ? <div className="absolute right-3 top-3">{action}</div> : null}
    </header>
  );
}
