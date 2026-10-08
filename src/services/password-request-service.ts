import { sendEmail } from "@/lib/email";
import { getRecaptchaToken, verifyRecaptchaToken } from "@/lib/recaptcha";
import { buildEventShareUrl } from "@/lib/share";
import {
  PHONE_CHANNEL_LABELS,
  validatePasswordRequest,
  type PasswordRequestInput,
} from "@/lib/validation";
import { getEventAccessInfo } from "@/repositories/event-repository";
import { getUserContact } from "@/repositories/user-repository";
import type { EventAccessResult } from "@/services/event-access-service";

// "Passwort anfragen" on a locked event page: forwarded once to the owner's
// account e-mail and not stored. An e-mail request gets Reply-To so the owner
// just answers; the owner's own address stays hidden until they do.
export function buildPasswordRequestEmail(
  request: PasswordRequestInput,
  eventTitle: string,
  link: string,
): { subject: string; text: string; replyTo?: string } {
  const { contact } = request;
  const via =
    contact.kind === "email"
      ? `per E-Mail an ${contact.email}`
      : `per ${contact.channel === "other" ? contact.channelOther : PHONE_CHANNEL_LABELS[contact.channel]} an ${contact.phone}`;

  const lines = [`„${request.name}“ möchte das Passwort für dein Event „${eventTitle}“ ${via}.`];
  if (request.message) lines.push("", `Nachricht: ${request.message}`);
  if (contact.kind === "email") {
    lines.push("", `Antworte einfach auf diese E-Mail, um ${request.name} das Passwort zu schicken.`);
  }
  lines.push("", `Event ansehen: ${link}`);

  return {
    subject: `Passwort-Anfrage für „${eventTitle}“`,
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
    return { ok: false, status: 404, error: "Event wurde nicht gefunden." };
  }
  if (!event.accessPassword) {
    return {
      ok: false,
      status: 409,
      error: "Dieses Event ist nicht mehr passwortgeschützt. Bitte lade die Seite neu.",
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
    return { ok: false, status: 503, error: "Die Anfrage konnte nicht zugestellt werden." };
  }

  const email = buildPasswordRequestEmail(validation.value, event.title, buildEventShareUrl(event.slug));
  await sendEmail({ to: owner.email, ...email });
  return { ok: true, data: { ok: true } };
}
