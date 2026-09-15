import { AuthButtons } from "./AuthButtons";
import { Button } from "./Button";

type SiteHeaderProps = {
  user: { name: string | null } | null;
};

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4">
      <span className="font-[family-name:var(--font-display)] text-xl text-leaf-dark">
        GASTZILLA
      </span>

      {user ? (
        <form action="/auth/signout" method="post">
          <Button variant="outline" type="submit">
            Logout
          </Button>
        </form>
      ) : (
        <AuthButtons />
      )}
    </header>
  );
}
