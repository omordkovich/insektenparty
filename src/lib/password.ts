import { err, type ErrorMessage } from "@/i18n/errors";

// Rules for new passwords (registration, password reset). Must match the
// Supabase setting under Authentication → Sign In / Providers → Email:
// minimum length 10 and "lowercase, uppercase letters, digits and symbols" -
// otherwise Supabase rejects a password the form accepted, with an English
// error message (or, if the setting is weaker, API callers skip the rule).
// Supabase only counts ASCII letters and its own symbol set, so umlauts and
// spaces are allowed but don't satisfy a rule. Login deliberately does not
// apply these rules (older, shorter passwords must keep working).
export const PASSWORD_MIN_LENGTH = 10;

// The symbols Supabase counts, shown to the user in the password hint dialog.
// Keep in sync with SYMBOL below (password.test.ts checks every one of them).
export const PASSWORD_SYMBOLS = "!@#$%^&*()_+-=[]{};':\"\\|<>?,./`~";

const SYMBOL = /[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/;

// The first broken rule, as a key into messages.errors (null = fine).
export function validateNewPassword(password: string): ErrorMessage | null {
  if (password.length < PASSWORD_MIN_LENGTH) return err("passwordTooShort", { min: PASSWORD_MIN_LENGTH });
  if (!/[a-z]/.test(password)) return err("passwordNeedsLower");
  if (!/[A-Z]/.test(password)) return err("passwordNeedsUpper");
  if (!/[0-9]/.test(password)) return err("passwordNeedsDigit");
  if (!SYMBOL.test(password)) return err("passwordNeedsSymbol");
  return null;
}
