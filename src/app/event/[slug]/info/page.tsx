import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { formatCreatedDate } from "@/lib/calendar";
import { getEventByAddress } from "@/repositories/event-repository";
import { getUserDisplayName } from "@/repositories/user-repository";

type EventInfoPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventInfoPage({ params }: EventInfoPageProps) {
  const { slug } = await params;
  const event = await getEventByAddress(slug);

  if (!event) {
    notFound();
  }
  if (event.slug !== slug) {
    permanentRedirect(`/event/${event.slug}/info`);
  }

  const ownerName = event.ownerId ? await getUserDisplayName(event.ownerId) : null;

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-col items-center justify-center px-6 py-16 text-center">
        <p className="max-w-md text-lg text-muted">
          Dieser Event wurde von{" "}
          <span className="font-bold text-leaf-dark">{ownerName ?? "einem Nutzer"}</span> am{" "}
          <span className="whitespace-nowrap font-bold text-leaf-dark">
            {formatCreatedDate(event.createdAt)}
          </span>{" "}
          erstellt.
        </p>
        <Link
          href={`/event/${slug}`}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-button-primary px-6 text-base font-bold text-button-primary-text transition hover:brightness-90"
        >
          Zurück zum event
        </Link>
      </main>
    </>
  );
}
