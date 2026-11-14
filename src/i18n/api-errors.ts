import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { isUuid } from "@/lib/validation";
import { getEventLanguage } from "@/repositories/event-repository";
import type { Locale } from "./config";
import { translateError, type ErrorMessage } from "./errors";
import { cookieLocale } from "./request-locale";

export function errorResponse(locale: Locale, error: ErrorMessage, status: number): NextResponse {
  return NextResponse.json({ error: translateError(locale, error) }, { status });
}

// Error responses for an API route, in the right language: routes of an
// event speak the event's language (a guest sees the event page in it),
// all others the visitor's choice. Resolved only when an error is sent.
export function apiErrors(context?: { params: Promise<{ eventId?: string }> }) {
  let locale: Promise<Locale> | undefined;
  const resolve = () =>
    (locale ??= (async () => {
      const eventId = context ? (await context.params).eventId : undefined;
      if (eventId && isUuid(eventId)) return getEventLanguage(eventId);
      return cookieLocale({ cookies: await cookies(), headers: await headers() });
    })());
  return async (error: ErrorMessage, status: number) => errorResponse(await resolve(), error, status);
}
