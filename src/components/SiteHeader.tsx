import Image from "next/image";
import { AuthButtons } from "./AuthButtons";
import { Button } from "./Button";

type SiteHeaderProps = {
  user: { name: string | null } | null;
};

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="grid grid-cols-3 items-center p-4">
      <div />

      <Image
        src="https://res.cloudinary.com/d6sufegz/image/upload/v1789641286/banner_l.webp"
        alt="GASTZILLA"
        width={256}
        height={91}
        className="mx-auto h-auto w-64"
        priority
      />

      <div className="flex justify-end">
        {user ? (
          <form action="/auth/signout" method="post">
            <Button variant="outline" type="submit">
              Logout
            </Button>
          </form>
        ) : (
          <AuthButtons />
        )}
      </div>
    </header>
  );
}
