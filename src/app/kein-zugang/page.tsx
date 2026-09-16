import Link from "next/link";

export default function KeinZugangPage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-2xl font-normal text-zinc-800 sm:text-3xl">Kein Zugang</h1>
      <p className="mt-3 max-w-md text-zinc-600">
        Diese Seite kannst du nur bearbeiten, wenn du als Eigentümer der Party
        eingeloggt bist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md border border-zinc-300 bg-white px-6 text-base font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
      >
        Zur Startseite
      </Link>
    </main>
  );
}
