import { getTranslations } from "next-intl/server";
import { ContentPage } from "@/components/ContentPage";

export async function generateMetadata() {
  const t = await getTranslations("common");
  return { title: t("notFoundTitle") };
}

// Shown for unknown URLs and missing events (notFound()). Next.js sends it
// with status 404 and noindex on its own.
export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <ContentPage title={t("notFoundHeading")}>
      <p className="text-center text-lg text-muted">{t("notFoundText")}</p>
    </ContentPage>
  );
}
