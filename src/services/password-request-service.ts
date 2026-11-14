import type { Locale } from "@/i18n/config";
import { err } from "@/i18n/errors";
import { serverTranslator } from "@/i18n/translator";
import { sendEmail } from "@/lib/email";
import { getRecaptchaToken, verifyRecaptchaToken } from "@/lib/recaptcha";
import { buildEventShareUrl } from "@/lib/share";
import {
  validatePasswordRequest,
  type PasswordRequestInput,
} from "@/lib/validation";
import { getEventAccessInfo } from "@/repositories/event-repository";
import { getUserContact } from "@/repositories/user-repository";
import { denyIfOver } from "@/services/event-lifecycle-service";
import type { EventAccessResult } from "@/services/event-access-service";

// "Passwort anfragen" on a locked event page: forwarded once to the owner's
// account e-mail and not stored. An e-mail request gets Reply-To so the owner
// just answers; the owner's own address stays hidden until they do.
export function buildPasswordRequestEmail(
  request: PasswordRequestInput,
  eventTitle: string,
  link: string,
  locale: Locale,
): { subject: string; text: string; replyTo?: string } {
  const t = serverTranslator(locale, "mail");
  const channels = serverTranslator(locale, "guestForm");
  const { contact } = request;
  const via =
    contact.kind === "email"
      ? t("viaEmail", { email: contact.email })
      : t("viaPhone", {
          channel: contact.channel === "other" ? (contact.channelOther ?? "") : channels(`channels.${contact.channel}`),
          phone: contact.phone,
        });

  const lines = [t("passwordRequestLine", { name: request.name, title: eventTitle, via })];
  if (request.message) lines.push("", t("messageLine", { message: request.message }));
  if (contact.kind === "email") {
    lines.push("", t("replyHint", { name: request.name }));
  }
  lines.push("", t("viewEvent", { link }));

  return {
    subject: t("passwordRequestSubject", { title: eventTitle }),
    text: lines.join("\n"),
    ...(contact.kind === "email" ? { replyTo: contact.email } : {}),
  };
}

export async function requestEventPassword(
  eventId: string,
  body: unknown,
): Promise<EventAccessResult<{ ok: true }>> {
  const event = await getEventAccessInfo(eventId);
  if (!event) {
    return { ok: false, status: 404, error: err("eventNotFound") };
  }
  const over = await denyIfOver(eventId);
  if (over) return over;
  if (!event.accessPassword) {
    return {
      ok: false,
      status: 409,
      error: err("noLongerProtected"),
    };
  }

  const recaptcha = await verifyRecaptchaToken(getRecaptchaToken(body));
  if (!recaptcha.ok) {
    return { ok: false, status: recaptcha.status, error: recaptcha.error };
  }

  const validation = validatePasswordRequest(body);
  if (!validation.ok) {
    return { ok: false, status: 400, error: validation.error };
  }

  const owner = event.ownerId ? await getUserContact(event.ownerId) : null;
  if (!owner?.email) {
    return { ok: false, status: 503, error: err("requestNotDelivered") };
  }

  // In the owner's account language - the mail goes to them.
  const email = buildPasswordRequestEmail(validation.value, event.title, buildEventShareUrl(event.slug), owner.locale);
  await sendEmail({ to: owner.email, ...email });
  return { ok: true, data: { ok: true } };
}
