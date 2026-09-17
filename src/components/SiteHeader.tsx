import Image from "next/image";

export function SiteHeader() {
  return (
    <header className="flex justify-center p-4">
      <Image
        src="https://res.cloudinary.com/d6sufegz/image/upload/v1789641286/banner_l.webp"
        alt="GASTZILLA"
        width={256}
        height={91}
        className="h-auto w-64"
        priority
      />
    </header>
  );
}
