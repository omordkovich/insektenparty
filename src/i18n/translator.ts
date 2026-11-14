import { createTranslator, type NamespaceKeys, type NestedKeyOf } from "next-intl";
import type { Locale } from "./config";
import { MESSAGES, type Messages } from "./messages";

// Synchronous translator with an explicit language - for code outside the
// React tree (API routes, mails, cron jobs) and for tests.
export function serverTranslator<N extends NamespaceKeys<Messages, NestedKeyOf<Messages>> = never>(
  locale: Locale,
  namespace?: N,
) {
  return createTranslator({ locale, messages: MESSAGES[locale], namespace });
}
