import type { Locale } from "./config";
import type { Messages } from "./messages";
import { serverTranslator } from "./translator";

// Errors travel as a key into messages.errors (plus ICU values) and are
// turned into text only where the language is known.
export type ErrorKey = keyof Messages["errors"];
export type ErrorMessage = { key: ErrorKey; values?: Record<string, string | number> };

export function err(key: ErrorKey, values?: ErrorMessage["values"]): ErrorMessage {
  return values ? { key, values } : { key };
}

export function translateError(locale: Locale, error: ErrorMessage): string {
  const t = serverTranslator(locale, "errors");
  return t(error.key, error.values);
}
