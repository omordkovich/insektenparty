import { z } from "zod";

// Rules for new passwords (registration, password reset). Must match the
// Supabase setting under Authentication → Email: minimum length 10 and
// "lowercase, uppercase letters and digits" - otherwise Supabase rejects a
// password the form accepted, with an English error message. Supabase only
// counts ASCII letters, so umlauts are allowed but don't satisfy a rule.
// Login deliberately does not apply these rules (older, shorter passwords
// must keep working).
export const PASSWORD_MIN_LENGTH = 10;

export const PASSWORD_HINT =
  "Mindestens 10 Zeichen, mit Groß- und Kleinbuchstaben und einer Ziffer.";

export const newPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Das Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen lang sein.`)
  .regex(/[a-z]/, "Das Passwort muss mindestens einen Kleinbuchstaben enthalten.")
  .regex(/[A-Z]/, "Das Passwort muss mindestens einen Großbuchstaben enthalten.")
  .regex(/[0-9]/, "Das Passwort muss mindestens eine Ziffer enthalten.");

export function validateNewPassword(password: string): string | null {
  const result = newPasswordSchema.safeParse(password);
  return result.success ? null : (result.error.issues[0]?.message ?? "Ungültiges Passwort.");
}
