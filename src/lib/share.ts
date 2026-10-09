import { SITE_URL } from "@/lib/site";

// Sharing an event page: the public URL plus one link per platform for
// browsers without the native share sheet (navigator.share).

export function buildEventShareUrl(slug: string): string {
  return `${SITE_URL}/event/${encodeURIComponent(slug)}`;
}

export function buildShareText(title: string): string {
  return `Du bist eingeladen: ${title}`;
}

export type ShareLink = {
  id: string;
  label: string;
  href: string;
  /** Open in a new tab (web platforms) - false for mailto:/sms:. */
  newTab: boolean;
  /** The platform can't take a URL (Instagram): copy the link first so the
   *  user can paste it there. */
  copyFirst?: boolean;
};

export function buildShareLinks({ url, title }: { url: string; title: string }): ShareLink[] {
  const text = buildShareText(title);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);

  return [
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      newTab: true,
    },
    { id: "telegram", label: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}`, newTab: true },
    {
      id: "email",
      label: "E-Mail",
      href: `mailto:?subject=${t}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
      newTab: false,
    },
    // "sms:?&body=" is the variant both iOS and Android understand.
    { id: "sms", label: "SMS", href: `sms:?&body=${encodeURIComponent(`${text} ${url}`)}`, newTab: false },
    { id: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, newTab: true },
    { id: "x", label: "X", href: `https://x.com/intent/post?text=${t}&url=${u}`, newTab: true },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      newTab: true,
    },
    { id: "vk", label: "VK", href: `https://vk.com/share.php?url=${u}&title=${t}`, newTab: true },
    { id: "instagram", label: "Instagram", href: "https://www.instagram.com/", newTab: true, copyFirst: true },
  ];
}

// Sharing a whole message (invitation text, "Termin steht fest") instead of
// just the link: only platforms that take free text. Telegram adds the link
// itself from `url`, so it is taken out of the text there.
export function buildMessageShareLinks({
  text,
  url,
  subject,
}: {
  text: string;
  url: string;
  subject: string;
}): ShareLink[] {
  const withoutLink = text
    .split("\n")
    .filter((line) => line.trim() !== url)
    .join("\n");

  return [
    { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(text)}`, newTab: true },
    {
      id: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(withoutLink)}`,
      newTab: true,
    },
    {
      id: "email",
      label: "E-Mail",
      href: `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
      newTab: false,
    },
    { id: "sms", label: "SMS", href: `sms:?&body=${encodeURIComponent(text)}`, newTab: false },
  ];
}

// Clipboard with a fallback for browsers/contexts without the async
// Clipboard API (older browsers, some in-app webviews). Browser-only.
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}
