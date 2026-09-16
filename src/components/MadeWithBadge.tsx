import Link from "next/link";

export function MadeWithBadge() {
  return (
    <div className="mt-6 text-center">
      <Link
        href="/"
        className="text-sm text-muted underline decoration-leaf/40 underline-offset-4 hover:text-leaf-dark"
      >
        made with Gastzilla© 2026
      </Link>
    </div>
  );
}
