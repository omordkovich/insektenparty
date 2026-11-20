import { describe, expect, it } from "vitest";
import { buildFeedbackAdminMail, buildFeedbackRequestMail, escapeHtml } from "@/lib/feedback-mails";

const FEEDBACK = "https://gastzilla.de/feedback?t=abc.def";
const UNSUB = "https://gastzilla.de/feedback/abmelden?t=ghi.jkl";

describe("buildFeedbackRequestMail", () => {
  it("asks for feedback in German with both links", () => {
    const mail = buildFeedbackRequestMail({ title: "Sommerfest", feedbackLink: FEEDBACK, unsubscribeLink: UNSUB }, "de");
    expect(mail.subject).toBe("Wie war „Sommerfest“?");
    expect(mail.text).toContain(FEEDBACK);
    expect(mail.text).toContain(UNSUB);
    expect(mail.html).toContain(`href="${escapeHtml(FEEDBACK)}"`);
    expect(mail.html).toContain(`href="${escapeHtml(UNSUB)}"`);
  });

  it("writes English for an English account", () => {
    const mail = buildFeedbackRequestMail({ title: "Summer party", feedbackLink: FEEDBACK, unsubscribeLink: UNSUB }, "en");
    expect(mail.subject).toBe("How was “Summer party”?");
    expect(mail.html).toContain("Give feedback");
  });

  it.each(["de", "en", "ru"] as const)("declares the account language %s in the HTML", (locale) => {
    const mail = buildFeedbackRequestMail({ title: "Fest", feedbackLink: FEEDBACK, unsubscribeLink: UNSUB }, locale);
    expect(mail.html.startsWith(`<!doctype html><html lang="${locale}">`)).toBe(true);
  });

  it("escapes the event title in the HTML part", () => {
    const mail = buildFeedbackRequestMail({ title: "<b>Fest</b>", feedbackLink: FEEDBACK, unsubscribeLink: UNSUB }, "de");
    expect(mail.html).not.toContain("<b>Fest</b>");
    expect(mail.html).toContain("&lt;b&gt;Fest&lt;/b&gt;");
  });
});

describe("buildFeedbackAdminMail", () => {
  const base = {
    rating: 4,
    text: "Hat super geklappt mit den Zusagen.",
    displayName: "Anna",
    language: "de" as const,
    createdAt: new Date("2026-11-19T10:00:00Z"),
    approveLink: "https://gastzilla.de/feedback/moderieren?t=x&a=approve",
    deleteLink: "https://gastzilla.de/feedback/moderieren?t=x&a=delete",
  };

  it("shows stars, name, language and both links", () => {
    const mail = buildFeedbackAdminMail(base);
    expect(mail.subject).toBe("Neue Bewertung (★4) – bitte prüfen");
    expect(mail.text).toContain("★★★★☆");
    expect(mail.text).toContain("Anna");
    expect(mail.text).toContain("Sprache: de");
    expect(mail.text).toContain(base.approveLink);
    expect(mail.text).toContain(base.deleteLink);
    expect(mail.html).toContain(`href="${escapeHtml(base.approveLink)}"`);
    expect(mail.html).toContain(`href="${escapeHtml(base.deleteLink)}"`);
  });

  it("is German, with the review marked in the language it was written in", () => {
    const mail = buildFeedbackAdminMail({ ...base, text: "Отлично, все ответили быстро.", language: "ru" });
    expect(mail.html.startsWith('<!doctype html><html lang="de">')).toBe(true);
    expect(mail.html).toContain('<blockquote lang="ru"');
  });

  it("says when no name may be shown", () => {
    expect(buildFeedbackAdminMail({ ...base, displayName: null }).text).toContain("(ohne Namen)");
  });

  it("escapes review text and name in the HTML part", () => {
    const mail = buildFeedbackAdminMail({ ...base, text: '<script>"&', displayName: "<b>A</b>" });
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).not.toContain("<b>A</b>");
    expect(mail.html).toContain("&lt;script&gt;&quot;&amp;");
  });
});

describe("mail HTML", () => {
  it("uses CSS instead of obsolete table attributes", () => {
    const request = buildFeedbackRequestMail({ title: "Fest", feedbackLink: FEEDBACK, unsubscribeLink: UNSUB }, "de").html;
    const admin = buildFeedbackAdminMail({
      rating: 5,
      text: "Hat super geklappt mit den Zusagen.",
      displayName: null,
      language: "de",
      createdAt: new Date("2026-11-19T10:00:00Z"),
      approveLink: "https://gastzilla.de/a",
      deleteLink: "https://gastzilla.de/d",
    }).html;
    for (const html of [request, admin]) {
      expect(html).not.toMatch(/\s(width|cellpadding|cellspacing)="/);
      expect(html).toContain("width:100%");
    }
  });
});
