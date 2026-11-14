"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import type { ErrorMessage } from "@/i18n/errors";

// Turns a validation error (shared with the server, see lib/validation.ts)
// into text in the page's language.
export function useErrorText(): (error: ErrorMessage) => string {
  const t = useTranslations("errors");
  return useCallback((error: ErrorMessage) => t(error.key, error.values), [t]);
}
