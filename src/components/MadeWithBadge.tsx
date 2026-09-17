import Image from "next/image";
import Link from "next/link";

export function MadeWithBadge() {
  return (
    <div className="mt-6 text-center">
      <Link href="/" className="inline-block">
        <Image
          src="https://res.cloudinary.com/d6sufegz/image/upload/v1789639601/banner_s.webp"
          alt="made with Gastzilla© 2026"
          width={256}
          height={128}
          className="mx-auto w-32 h-auto"
        />
      </Link>
    </div>
  );
}
