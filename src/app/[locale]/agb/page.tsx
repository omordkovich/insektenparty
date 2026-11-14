import { LegalPage, legalPageMetadata } from "@/components/LegalPage";
import type { LocaleParams } from "@/i18n/page-locale";

export async function generateMetadata({ params }: LocaleParams) {
  return legalPageMetadata("terms", params);
}

export default function Page({ params }: LocaleParams) {
  return <LegalPage document="terms" params={params} />;
}
