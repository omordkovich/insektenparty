import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex justify-center p-4">
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
    </header>
  );
}
