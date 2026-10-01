import { ContentPage } from "@/components/ContentPage";
import { TermsContent } from "@/components/TermsContent";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { pageMetadata } from "@/lib/page-metadata";

const DOC = LEGAL_DOCUMENTS.terms;

export const metadata = pageMetadata({
  title: `${DOC.title} – GASTZILLA`,
  description: DOC.description,
  path: DOC.href,
});

export default function Page() {
  return (
    <ContentPage title={DOC.title}>
      <TermsContent />
    </ContentPage>
  );
}
