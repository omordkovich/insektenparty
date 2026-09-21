import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { getEventBySlug } from "@/repositories/event-repository";
import { getUserDisplayName } from "@/repositories/user-repository";

type EventInfoPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventInfoPage({ params }: EventInfoPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const ownerName = event.ownerId ? await getUserDisplayName(event.ownerId) : null;

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-col items-center justify-center px-6 py-16 text-center">
        <p className="max-w-md text-lg text-zinc-700">
          Dieser Event wurde von{" "}
          <span className="font-bold text-leaf-dark">{ownerName ?? "einem Nutzer"}</span>{" "}
          erstellt.
        </p>
        <Link
          href={`/p/${slug}`}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-leaf px-6 text-base font-bold text-white transition hover:bg-leaf-dark"
        >
          Zurück zum event
        </Link>
      </main>
    </>
  );
}
