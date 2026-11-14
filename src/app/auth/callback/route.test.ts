import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TERMS_VERSION } from "@/lib/legal-info";
import { GOOGLE_CONSENT_COOKIE } from "@/lib/terms-consent";

const exchangeCodeForSession = vi.fn();
const updateUser = vi.fn();
const refreshSession = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { exchangeCodeForSession, updateUser, refreshSession } }),
}));

import { GET } from "./route";

// `consented` mimics the register tab, which sets the consent cookie before
// redirecting to Google.
function call(query: string, consented = false, extraCookie?: string, acceptLanguage?: string) {
  const cookies = [consented ? `${GOOGLE_CONSENT_COOKIE}=1` : null, extraCookie ?? null].filter(Boolean);
  const headers: Record<string, string> = cookies.length ? { cookie: cookies.join("; ") } : {};
  if (acceptLanguage) headers["accept-language"] = acceptLanguage;
  return GET(new NextRequest(`http://localhost:3000/auth/callback?${query}`, { headers }));
}

function locationOf(response: Response) {
  const url = new URL(response.headers.get("location") ?? "");
  return url.pathname + url.search;
}

// A first Google login: Google delivers `name`, there is no consent yet.
const newGoogleUser = { user: { user_metadata: { name: "Max Google", full_name: "Max Google" } } };
// A returning account that already has a language.
const returningUser = { user: { user_metadata: { name: "Max Google", locale: "de" } } };

describe("GET /auth/callback", () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset();
    updateUser.mockReset();
    refreshSession.mockReset();
    updateUser.mockResolvedValue({ error: null });
    refreshSession.mockResolvedValue({ error: null });
  });

  it("signs the user in and sends them to the start page", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: newGoogleUser, error: null });

    expect(locationOf(await call("code=abc"))).toBe("/");
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
  });

  it("stores nothing for a login-tab sign-in (the ConsentDialog asks later)", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: returningUser, error: null });

    await call("code=abc");

    expect(updateUser).not.toHaveBeenCalled();
  });

  it("stores the consent for a register-tab sign-in", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: newGoogleUser, error: null });

    await call("code=abc", true);

    expect(updateUser).toHaveBeenCalledWith({
      data: expect.objectContaining({
        terms_accepted_at: expect.any(String),
        terms_version: expect.any(String),
        privacy_version: expect.any(String),
        min_age_confirmed: expect.any(Number),
      }),
    });
    // The new metadata only reaches the session cookie's JWT after a refresh.
    expect(refreshSession).toHaveBeenCalled();
  });

  it("does not touch the name", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: newGoogleUser, error: null });

    await call("code=abc", true);

    const { data } = updateUser.mock.calls[0][0];
    expect(data).not.toHaveProperty("name");
    expect(data).not.toHaveProperty("display_name");
  });

  it("keeps the consent record of an account that already accepted the current AGB", async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: {
        user: {
          user_metadata: { terms_accepted_at: "2026-11-05T10:00:00.000Z", terms_version: TERMS_VERSION, locale: "de" },
        },
      },
      error: null,
    });

    await call("code=abc", true);

    expect(updateUser).not.toHaveBeenCalled();
  });

  it("renews an older consent but keeps its first acceptance", async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: {
        user: {
          user_metadata: { terms_accepted_at: "2026-09-30T10:00:00.000Z", terms_version: "2026-09-30" },
        },
      },
      error: null,
    });

    await call("code=abc", true);

    expect(updateUser).toHaveBeenCalledWith({
      data: expect.objectContaining({
        terms_version: TERMS_VERSION,
        terms_first_accepted_at: "2026-09-30T10:00:00.000Z",
      }),
    });
  });

  it("ignores a consent query parameter (only the cookie counts)", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: returningUser, error: null });

    await call("code=abc&consent=1");

    expect(updateUser).not.toHaveBeenCalled();
  });

  it("saves this device's language on an account that has none yet", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: newGoogleUser, error: null });

    const response = await call("code=abc", false, "NEXT_LOCALE=en");

    expect(updateUser).toHaveBeenCalledWith({ data: { locale: "en" } });
    expect(response.headers.get("set-cookie")).toContain("NEXT_LOCALE=en");
  });

  it("takes the browser language for a new account when no language was chosen", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: newGoogleUser, error: null });

    await call("code=abc", false, undefined, "en-GB,en;q=0.9");

    expect(updateUser).toHaveBeenCalledWith({ data: { locale: "en" } });
  });

  it("brings the account's language to this device", async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: { user: { user_metadata: { name: "Max", locale: "en" } } },
      error: null,
    });

    const response = await call("code=abc", false, "NEXT_LOCALE=de");

    expect(updateUser).not.toHaveBeenCalled();
    expect(response.headers.get("set-cookie")).toContain("NEXT_LOCALE=en");
  });

  it("clears the one-time cookie", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: newGoogleUser, error: null });

    const response = await call("code=abc", true);

    expect(response.headers.get("set-cookie")).toContain(`${GOOGLE_CONSENT_COOKIE}=;`);
  });

  it("follows a safe `next` path", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: newGoogleUser, error: null });

    expect(locationOf(await call("code=abc&next=/event/xyz"))).toBe("/event/xyz");
  });

  it("ignores an unsafe `next` path", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: newGoogleUser, error: null });

    expect(locationOf(await call("code=abc&next=//evil.example"))).toBe("/");
  });

  it("flags a failed code exchange instead of silently landing on the start page", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { user: null }, error: { code: "bad" } });

    expect(locationOf(await call("code=abc&next=/event/xyz"))).toBe("/?auth_error=1");
  });

  it("flags a missing code (e.g. the user cancelled at Google)", async () => {
    expect(locationOf(await call("error=access_denied"))).toBe("/?auth_error=1");
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });
});
