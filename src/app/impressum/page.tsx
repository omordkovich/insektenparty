import { ContentPage } from "@/components/ContentPage";
import { ImprintContent } from "@/components/ImprintContent";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { pageMetadata } from "@/lib/page-metadata";

const DOC = LEGAL_DOCUMENTS.imprint;

export const metadata = pageMetadata({
  title: `${DOC.title} – GASTZILLA`,
  description: DOC.description,
  path: DOC.href,
});

export default function Page() {
  return (
    <ContentPage title={DOC.title}>
      <ImprintContent />
    </ContentPage>
  );
}
