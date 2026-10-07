import slugify from "@sindresorhus/slugify";

// Event page addresses: /event/<first name>-<title>-<key>, e.g.
// /event/anna-sommerfest-k7q2xm. The key (random suffix, stored as
// events.slug_key) identifies the event for good: the readable part follows
// the title when it is renamed, and any address ending in the key still
// finds the event (and redirects to the current one). The key is also what
// keeps guest lists private - event pages have no password, so an address
// must not be guessable from name + title.

// No 0/o, 1/i/l: the link is sometimes typed off a phone screen.
export const SLUG_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
// 31^6 ≈ 890 million suffixes per name + title - too many to try out.
export const SLUG_SUFFIX_LENGTH = 6;

const MAX_NAME_LENGTH = 20;
const MAX_TITLE_LENGTH = 40;

// Latin transliteration (Cyrillic, Greek, Arabic, Polish, Turkish, ...);
// German umlauts become ae/oe/ue/ss. Scripts it can't transliterate (e.g.
// Chinese) end up empty and are left out.
function toSlugPart(text: string, maxLength: number): string {
  return slugify(text, { customReplacements: [["&", " und "]] })
    .slice(0, maxLength)
    .replace(/-+$/, "");
}

function generateSlugKey(): string {
  // Rejection sampling keeps every character equally likely (256 is not a
  // multiple of the alphabet size).
  const limit = 256 - (256 % SLUG_ALPHABET.length);
  let suffix = "";
  while (suffix.length < SLUG_SUFFIX_LENGTH) {
    for (const byte of crypto.getRandomValues(new Uint8Array(SLUG_SUFFIX_LENGTH * 2))) {
      if (byte < limit && suffix.length < SLUG_SUFFIX_LENGTH) {
        suffix += SLUG_ALPHABET[byte % SLUG_ALPHABET.length];
      }
    }
  }
  return suffix;
}

// The owner's part of the address. Only the first name - a Google
// account's display name is usually the full name, which shouldn't be in
// every shared link. Fixed at creation (events.slug_name).
export function slugNamePart(ownerName: string | null): string {
  const firstName = ownerName?.trim().split(/\s+/)[0] ?? "";
  return toSlugPart(firstName, MAX_NAME_LENGTH);
}

export function buildSlug({ namePart, title, key }: { namePart: string; title: string; key: string }): string {
  const titlePart = toSlugPart(title, MAX_TITLE_LENGTH) || "event";
  return [namePart, titlePart, key].filter(Boolean).join("-");
}

export function generateSlug({ title, ownerName }: { title: string; ownerName: string | null }): {
  slug: string;
  key: string;
  namePart: string;
} {
  const key = generateSlugKey();
  const namePart = slugNamePart(ownerName);
  return { slug: buildSlug({ namePart, title, key }), key, namePart };
}

// The key part of an address: everything after the last dash. Old
// addresses without a dash (e.g. "milans7BD") are their own key.
export function slugKeyOf(slug: string): string {
  return slug.slice(slug.lastIndexOf("-") + 1);
}
