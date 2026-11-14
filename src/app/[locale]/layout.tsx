import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { HtmlShell } from "@/components/HtmlShell";
import { isLocale, LOCALES } from "@/i18n/config";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return <HtmlShell locale={locale}>{children}</HtmlShell>;
}
