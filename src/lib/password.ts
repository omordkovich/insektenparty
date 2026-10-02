import { z } from "zod";

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

export const newPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Das Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen lang sein.`)
  .regex(/[a-z]/, "Das Passwort muss mindestens einen Kleinbuchstaben enthalten.")
  .regex(/[A-Z]/, "Das Passwort muss mindestens einen Großbuchstaben enthalten.")
  .regex(/[0-9]/, "Das Passwort muss mindestens eine Ziffer enthalten.")
  .regex(SYMBOL, "Das Passwort muss mindestens ein Sonderzeichen enthalten, z. B. ! ? # $ %.");

export function validateNewPassword(password: string): string | null {
  const result = newPasswordSchema.safeParse(password);
  return result.success ? null : (result.error.issues[0]?.message ?? "Ungültiges Passwort.");
}
