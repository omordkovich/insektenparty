import { ContentPage } from "@/components/ContentPage";
import { PrivacyPolicyContent } from "@/components/PrivacyPolicyContent";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { pageMetadata } from "@/lib/page-metadata";

const DOC = LEGAL_DOCUMENTS.privacy;

export const metadata = pageMetadata({
  title: `${DOC.title} – GASTZILLA`,
  description: DOC.description,
  path: DOC.href,
});

export default function Page() {
  return (
    <ContentPage title={DOC.title}>
      <PrivacyPolicyContent />
    </ContentPage>
  );
}
