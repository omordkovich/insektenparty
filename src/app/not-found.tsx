import { ContentPage } from "@/components/ContentPage";

export const metadata = {
  title: "Seite nicht gefunden – GASTZILLA",
};

// Shown for unknown URLs and missing events (notFound()). Next.js sends it
// with status 404 and noindex on its own.
export default function NotFound() {
  return (
    <ContentPage title="Seite nicht gefunden">
      <p className="text-center text-lg text-muted">
        Diese Seite gibt es nicht (mehr). Vielleicht ist der Link unvollständig oder das Event
        wurde gelöscht – frag am besten bei der Person nach, die dich eingeladen hat.
      </p>
    </ContentPage>
  );
}
