import { describe, expect, it } from "vitest";
import { buildEventShareUrl, buildShareLinks, buildShareText } from "@/lib/share";

describe("buildEventShareUrl", () => {
  it("appends the event path to the share base URL", () => {
    expect(buildEventShareUrl("milans7BD")).toBe("https://gastzilla.de/event/milans7BD");
  });

  it("encodes unusual characters in the slug", () => {
    expect(buildEventShareUrl("a b")).toBe("https://gastzilla.de/event/a%20b");
  });
});

describe("buildShareText", () => {
  it("names the event", () => {
    expect(buildShareText("Milans 7. Geburtstag")).toBe(
      "Du bist eingeladen: Milans 7. Geburtstag",
    );
  });
});

describe("buildShareLinks", () => {
  const url = "https://gastzilla.de/event/milans7BD";
  const links = buildShareLinks({ url, title: "Milans Party & mehr" });
  const byId = Object.fromEntries(links.map((link) => [link.id, link]));
  const enc = encodeURIComponent;
  const text = "Du bist eingeladen: Milans Party & mehr";

  it("offers every requested platform", () => {
    expect(links.map((link) => link.id)).toEqual([
      "whatsapp",
      "telegram",
      "email",
      "sms",
      "facebook",
      "x",
      "linkedin",
      "vk",
      "instagram",
    ]);
  });

  it("puts text and URL into the WhatsApp message", () => {
    expect(byId.whatsapp.href).toBe(`https://wa.me/?text=${enc(`${text} ${url}`)}`);
  });

  it("builds the Telegram, Facebook, X, LinkedIn and VK share URLs", () => {
    expect(byId.telegram.href).toBe(`https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`);
    expect(byId.facebook.href).toBe(`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`);
    expect(byId.x.href).toBe(`https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}`);
    expect(byId.linkedin.href).toBe(
      `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    );
    expect(byId.vk.href).toBe(`https://vk.com/share.php?url=${enc(url)}&title=${enc(text)}`);
  });

  it("builds mailto and sms links with the URL in the body", () => {
    expect(byId.email.href).toBe(
      `mailto:?subject=${enc(text)}&body=${enc(`${text}\n\n${url}`)}`,
    );
    expect(byId.sms.href).toBe(`sms:?&body=${enc(`${text} ${url}`)}`);
  });

  it("marks Instagram as copy-then-open, since it has no share URL", () => {
    expect(byId.instagram).toMatchObject({
      href: "https://www.instagram.com/",
      copyFirst: true,
    });
  });

  it("opens web platforms in a new tab but not mailto/sms", () => {
    expect(byId.whatsapp.newTab).toBe(true);
    expect(byId.email.newTab).toBe(false);
    expect(byId.sms.newTab).toBe(false);
  });
});
