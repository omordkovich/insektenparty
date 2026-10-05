import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
const updateUser = vi.fn();
const refreshSession = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { exchangeCodeForSession, updateUser, refreshSession } }),
}));

import { GET } from "./route";

function call(query: string) {
  return GET(new NextRequest(`http://localhost:3000/auth/callback?${query}`));
}

function locationOf(response: Response) {
  const url = new URL(response.headers.get("location") ?? "");
  return url.pathname + url.search;
}

const newGoogleUser = { user: { user_metadata: { name: "Max", full_name: "Max" } } };

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

  it("does not store consent when the user did not tick the boxes (the ConsentDialog asks later)", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: newGoogleUser, error: null });

    await call("code=abc");

    expect(updateUser).not.toHaveBeenCalled();
  });

  it("stores consent for a new account that ticked the boxes while registering", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: newGoogleUser, error: null });

    await call("code=abc&consent=1");

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

  it("keeps the original consent record of an account that already accepted", async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: { user: { user_metadata: { terms_accepted_at: "2026-09-30T10:00:00.000Z" } } },
      error: null,
    });

    await call("code=abc&consent=1");

    expect(updateUser).not.toHaveBeenCalled();
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
