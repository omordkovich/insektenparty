import { ContentPage } from "@/components/ContentPage";
import { WithdrawalContent } from "@/components/WithdrawalContent";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { pageMetadata } from "@/lib/page-metadata";

const DOC = LEGAL_DOCUMENTS.withdrawal;

export const metadata = pageMetadata({
  title: `${DOC.title} – GASTZILLA`,
  description: DOC.description,
  path: DOC.href,
});

export default function Page() {
  return (
    <ContentPage title={DOC.title}>
      <WithdrawalContent />
    </ContentPage>
  );
}
