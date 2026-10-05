// The display name is the one name we show (start page, notification mails,
// event info page). It lives under its own key because Google overwrites the
// user metadata's `name` on every login. We never read `name`.
// Keep the SQL in user-repository.ts in sync.
export const DISPLAY_NAME_KEY = "display_name";

export function getAccountName(userMetadata: unknown): string | null {
  if (typeof userMetadata !== "object" || userMetadata === null) return null;

  const value = (userMetadata as Record<string, unknown>)[DISPLAY_NAME_KEY];
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

export type SignInMethods = {
  hasGoogle: boolean;
  // An email identity exists, i.e. the account can log in with a password.
  hasPassword: boolean;
};

// Reads how an account signs in from the JWT's `app_metadata`
// (`provider` = first sign-in method, `providers` = all linked ones).
export function getSignInMethods(appMetadata: unknown): SignInMethods {
  const meta =
    typeof appMetadata === "object" && appMetadata !== null
      ? (appMetadata as Record<string, unknown>)
      : {};

  const providers = Array.isArray(meta.providers)
    ? meta.providers.filter((value): value is string => typeof value === "string")
    : typeof meta.provider === "string"
      ? [meta.provider]
      : [];

  const hasGoogle = providers.includes("google");
  // Nothing known (or only "email"): treat it as a regular email account.
  const hasPassword = providers.length === 0 || providers.includes("email");

  return { hasGoogle, hasPassword };
}
