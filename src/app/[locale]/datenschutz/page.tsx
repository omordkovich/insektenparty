import { LegalPage, legalPageMetadata } from "@/components/LegalPage";
import type { LocaleParams } from "@/i18n/page-locale";

export async function generateMetadata({ params }: LocaleParams) {
  return legalPageMetadata("privacy", params);
}

export default function Page({ params }: LocaleParams) {
  return <LegalPage document="privacy" params={params} />;
}
