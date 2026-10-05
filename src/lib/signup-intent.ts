import { validatePersonName } from "./validation";

// What the register tab hands over to /auth/callback across Google's redirect:
// the chosen display name, and - by existing at all - that the AGB/age
// checkboxes were ticked. A short-lived cookie that is only sent to the
// callback path keeps the name out of the URL (history, logs).
export const SIGNUP_INTENT_COOKIE = "gz_signup_intent";
export const SIGNUP_INTENT_PATH = "/auth/callback";
export const SIGNUP_INTENT_MAX_AGE_SECONDS = 600;

export type SignupIntent = { displayName: string };

// base64url of the JSON: only [A-Za-z0-9_-], so no layer between browser and
// server can mangle it by (de)coding it differently.
export function serializeSignupIntent(displayName: string): string {
  const bytes = new TextEncoder().encode(JSON.stringify({ displayName }));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// The cookie is client-controlled, so the name is validated like any input.
export function parseSignupIntent(raw: string | undefined): SignupIntent | null {
  if (!raw) return null;

  try {
    const base64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));

    const result = validatePersonName((parsed as { displayName?: unknown } | null)?.displayName);
    return result.ok ? { displayName: result.value } : null;
  } catch {
    return null;
  }
}
