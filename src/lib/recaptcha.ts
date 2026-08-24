type RecaptchaVerifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getRecaptchaToken(body: unknown): string | null {
  if (!isPlainObject(body)) return null;
  if (typeof body.recaptchaToken !== "string") return null;
  const token = body.recaptchaToken.trim();
  return token.length > 0 ? token : null;
}

export async function verifyRecaptchaToken(
  token: string | null,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  if (!token) {
    return {
      ok: false,
      status: 400,
      error: "Bitte bestätige, dass du kein Roboter bist.",
    };
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error("RECAPTCHA_SECRET_KEY is not set.");
    return {
      ok: false,
      status: 500,
      error:
        "Der Gast konnte nicht gespeichert werden. Bitte versuche es erneut.",
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
        error: "Die Roboterprüfung ist fehlgeschlagen. Bitte versuche es erneut.",
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("reCAPTCHA verification request failed:", error);
    return {
      ok: false,
      status: 500,
      error:
        "Der Gast konnte nicht gespeichert werden. Bitte versuche es erneut.",
    };
  }
}
