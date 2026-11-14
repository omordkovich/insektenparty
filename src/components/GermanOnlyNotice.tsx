import { getLocale, getTranslations } from "next-intl/server";
import { DEFAULT_LOCALE } from "@/i18n/config";

// Above content that exists in German only (About and the comparison) when the frame is in another language.
export async function GermanOnlyNotice() {
  if ((await getLocale()) === DEFAULT_LOCALE) return null;
  const t = await getTranslations("legal");
  return (
    <p className="mx-auto mb-6 max-w-2xl rounded-2xl border border-leaf/20 bg-leaf/5 px-4 py-3 text-center text-sm text-muted">
      {t("germanOnly")}
    </p>
  );
}
