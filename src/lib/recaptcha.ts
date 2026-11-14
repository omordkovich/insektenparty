import { err, type ErrorMessage } from "@/i18n/errors";
import { z } from "zod";

type RecaptchaVerifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

const recaptchaBodySchema = z.object({ recaptchaToken: z.string().trim().min(1) });

export function getRecaptchaToken(body: unknown): string | null {
  const result = recaptchaBodySchema.safeParse(body);
  return result.success ? result.data.recaptchaToken : null;
}

export async function verifyRecaptchaToken(
  token: string | null,
): Promise<{ ok: true } | { ok: false; error: ErrorMessage; status: number }> {
  if (!token) {
    return {
      ok: false,
      status: 400,
      error: err("recaptchaRequired"),
    };
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error("RECAPTCHA_SECRET_KEY is not set.");
    return {
      ok: false,
      status: 500,
      error:
        err("guestSaveFailed"),
    };
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret,
          response: token,
        }),
      },
    );

    const result = (await response.json()) as RecaptchaVerifyResponse;
    if (!result.success) {
      console.error("reCAPTCHA verification failed:", result["error-codes"]);
      return {
        ok: false,
        status: 400,
        error: err("recaptchaFailed"),
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("reCAPTCHA verification request failed:", error);
    return {
      ok: false,
      status: 500,
      error:
        err("guestSaveFailed"),
    };
  }
}
