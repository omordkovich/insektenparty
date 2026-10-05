import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
function call(query: string, consented = false) {
  const headers: Record<string, string> = consented
    ? { cookie: `${GOOGLE_CONSENT_COOKIE}=1` }
    : {};
  return GET(new NextRequest(`http://localhost:3000/auth/callback?${query}`, { headers }));
}

function locationOf(response: Response) {
  const url = new URL(response.headers.get("location") ?? "");
  return url.pathname + url.search;
}

// A first Google login: Google delivers `name`, there is no consent yet.
const newGoogleUser = { user: { user_metadata: { name: "Max Google", full_name: "Max Google" } } };

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
    exchangeCodeForSession.mockResolvedValue({ data: newGoogleUser, error: null });

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

  it("keeps the original consent record of an account that already accepted", async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: { user: { user_metadata: { terms_accepted_at: "2026-09-30T10:00:00.000Z" } } },
      error: null,
    });

    await call("code=abc", true);

    expect(updateUser).not.toHaveBeenCalled();
  });

  it("ignores a consent query parameter (only the cookie counts)", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: newGoogleUser, error: null });

    await call("code=abc&consent=1");

    expect(updateUser).not.toHaveBeenCalled();
  });

  it("clears the one-time cookie", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: newGoogleUser, error: null });

    const response = await call("code=abc", true);

    expect(response.headers.get("set-cookie")).toContain(`${GOOGLE_CONSENT_COOKIE}=;`);
  });

  it("follows a safe `next` path", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: newGoogleUser, error: null });

    expect(locationOf(await call("code=abc&next=/p/xyz"))).toBe("/p/xyz");
  });

  it("ignores an unsafe `next` path", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: newGoogleUser, error: null });

    expect(locationOf(await call("code=abc&next=//evil.example"))).toBe("/");
  });

  it("flags a failed code exchange instead of silently landing on the start page", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { user: null }, error: { code: "bad" } });

    expect(locationOf(await call("code=abc&next=/p/xyz"))).toBe("/?auth_error=1");
  });

  it("flags a missing code (e.g. the user cancelled at Google)", async () => {
    expect(locationOf(await call("error=access_denied"))).toBe("/?auth_error=1");
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });
});
