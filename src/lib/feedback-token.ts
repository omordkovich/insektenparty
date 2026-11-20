import { createHmac, timingSafeEqual } from "node:crypto";

// Signed links of the feedback feature (feedback page, moderation, unsubscribe):
// `<base64url(JSON payload)>.<base64url(HMAC-SHA256)>`. Nothing is stored -
// the server only checks the signature. Changing FEEDBACK_SECRET makes every
// link invalid. Kept free of Next.js so it can be tested.

export type FeedbackTokenKind = "feedback" | "moderate" | "unsubscribe";

// The feedback link is valid for this many days after the mail went out.
export const FEEDBACK_LINK_VALID_DAYS = 30;

type Payload = { k: FeedbackTokenKind; id: string; exp?: string };

export function getFeedbackSecret(): string | null {
  return process.env.FEEDBACK_SECRET || null;
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

// `exp`: last valid day, YYYY-MM-DD (Berlin); without it the link never expires.
export function signFeedbackToken(
  payload: { kind: FeedbackTokenKind; id: string; exp?: string },
  secret: string,
): string {
  const body: Payload = { k: payload.kind, id: payload.id, ...(payload.exp ? { exp: payload.exp } : {}) };
  const data = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

export function verifyFeedbackToken(
  token: string,
  kind: FeedbackTokenKind,
  secret: string,
  today: string,
): { id: string } | null {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [data, signature] = parts;

  const expected = Buffer.from(sign(data, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  let payload: Partial<Payload>;
  try {
    payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (payload.k !== kind || typeof payload.id !== "string" || !payload.id) return null;
  if (payload.exp !== undefined && (typeof payload.exp !== "string" || today > payload.exp)) return null;
  return { id: payload.id };
}
