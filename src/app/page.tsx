import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="max-w-xl text-2xl font-normal text-zinc-800 sm:text-3xl">
        Willkomen auf die Seite unserer Familie!
      </h1>
      <Link
        href="/milans7BD"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-md border border-zinc-300 bg-white px-6 text-base font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
      >
        Milans 7. Geburtstagsparty
      </Link>
    </main>
  );
}
