import type { Locale } from "@/i18n/config";
import { serverTranslator } from "@/i18n/translator";

// Mails of the feedback feature, each as plain text plus a simple HTML
// version (buttons). Every value put into the HTML goes through escapeHtml.

const GREEN = "#2f7d4a";
const AMBER = "#b45309";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function button(href: string, label: string, color: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px;margin:4px 8px 4px 0">${escapeHtml(label)}</a>`;
}

// `lang`: the language the mail is written in (mail apps and screen readers).
function layout(body: string, lang: Locale): string {
  return `<!doctype html><html lang="${lang}"><body style="margin:0;padding:24px;background:#f7f5ef;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#27272a"><table role="presentation" style="width:100%;max-width:560px;margin:0 auto;border-spacing:0;background:#ffffff;border-radius:16px"><tr><td style="padding:28px">${body}</td></tr></table></body></html>`;
}

function paragraph(text: string, style = ""): string {
  return `<p style="margin:0 0 16px;line-height:1.5;${style}">${escapeHtml(text)}</p>`;
}

export function stars(rating: number): string {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

// To the host, the day after the event (lifecycle job).
export function buildFeedbackRequestMail(
  input: { title: string; feedbackLink: string; unsubscribeLink: string },
  locale: Locale,
): { subject: string; text: string; html: string } {
  const t = serverTranslator(locale, "mail");
  const greeting = t("feedbackGreeting", { title: input.title });
  const ask = t("feedbackAsk");
  const why = t("feedbackWhy");
  const text = [
    greeting,
    "",
    ask,
    "",
    t("feedbackLinkLine", { link: input.feedbackLink }),
    "",
    why,
    t("feedbackUnsubscribeLine", { link: input.unsubscribeLink }),
  ].join("\n");
  const html = layout(
    paragraph(greeting, "font-weight:bold;font-size:18px") +
      paragraph(ask) +
      `<p style="margin:0 0 24px">${button(input.feedbackLink, t("feedbackButton"), GREEN)}</p>` +
      paragraph(why, "font-size:13px;color:#71717a") +
      `<p style="margin:0;font-size:13px"><a href="${escapeHtml(input.unsubscribeLink)}" style="color:#71717a">${escapeHtml(t("feedbackUnsubscribe"))}</a></p>`,
    locale,
  );
  return { subject: t("feedbackSubject", { title: input.title }), text, html };
}

// To info@gastzilla.de (German only): review + "Posten" / "Löschen".
export function buildFeedbackAdminMail(input: {
  rating: number;
  text: string;
  displayName: string | null;
  language: Locale;
  createdAt: Date;
  approveLink: string;
  deleteLink: string;
}): { subject: string; text: string; html: string } {
  const name = input.displayName ?? "(ohne Namen)";
  const date = input.createdAt.toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
  const meta = [`Name: ${name}`, `Sprache: ${input.language}`, `Eingegangen: ${date}`];
  const text = [
    "Neue Bewertung – erscheint erst nach Freigabe auf der Startseite.",
    "",
    stars(input.rating),
    input.text,
    "",
    ...meta,
    "",
    `Posten: ${input.approveLink}`,
    `Löschen: ${input.deleteLink}`,
  ].join("\n");
  const html = layout(
    paragraph("Neue Bewertung – erscheint erst nach Freigabe auf der Startseite.", "font-weight:bold") +
      paragraph(stars(input.rating), `font-size:22px;color:${AMBER}`) +
      `<blockquote lang="${input.language}" style="margin:0 0 16px;padding:12px 16px;border-left:4px solid ${GREEN};background:#f4f8f5;line-height:1.5">${escapeHtml(input.text)}</blockquote>` +
      meta.map((line) => paragraph(line, "margin:0 0 4px;font-size:14px;color:#52525b")).join("") +
      `<p style="margin:24px 0 0">${button(input.approveLink, "Posten", GREEN)}${button(input.deleteLink, "Löschen", AMBER)}</p>`,
    "de",
  );
  return { subject: `Neue Bewertung (★${input.rating}) – bitte prüfen`, text, html };
}
