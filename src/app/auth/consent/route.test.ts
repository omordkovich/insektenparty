import { beforeEach, describe, expect, it, vi } from "vitest";

const getClaims = vi.fn();
const updateUser = vi.fn();
const refreshSession = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getClaims, updateUser, refreshSession } }),
}));

import { POST } from "./route";

function call(body?: unknown) {
  return POST(
    new Request("http://localhost:3000/auth/consent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}

function signedIn(userMetadata: Record<string, unknown>) {
  getClaims.mockResolvedValue({ data: { claims: { sub: "u1", user_metadata: userMetadata } } });
}

describe("POST /auth/consent", () => {
  beforeEach(() => {
    getClaims.mockReset();
    updateUser.mockReset();
    refreshSession.mockReset();
    updateUser.mockResolvedValue({ error: null });
    refreshSession.mockResolvedValue({ error: null });
  });

  it("rejects requests without a session", async () => {
    getClaims.mockResolvedValue({ data: null });

    const response = await call({ displayName: "Maxi" });

    expect(response.status).toBe(401);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("records consent and the display name, then refreshes the session", async () => {
    signedIn({ name: "Max Google" });

    const response = await call({ displayName: "Maxi" });

    expect(response.status).toBe(200);
    expect(updateUser).toHaveBeenCalledWith({
      data: expect.objectContaining({
        terms_accepted_at: expect.any(String),
        display_name: "Maxi",
      }),
    });
    expect(refreshSession).toHaveBeenCalled();
  });

  it("requires a valid display name when the account has none", async () => {
    signedIn({ name: "Max Google" });

    expect((await call({ displayName: "  " })).status).toBe(400);
    expect((await call({})).status).toBe(400);
    expect((await call()).status).toBe(400);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("needs no name from an account that already has one", async () => {
    signedIn({ display_name: "Original" });

    const response = await call();

    expect(response.status).toBe(200);
    const { data } = updateUser.mock.calls[0][0];
    expect(data).toHaveProperty("terms_accepted_at");
    expect(data).not.toHaveProperty("display_name");
  });

  it("leaves a complete account untouched", async () => {
    signedIn({ terms_accepted_at: "2026-09-30T10:00:00Z", display_name: "Original" });

    const response = await call();

    expect(response.status).toBe(200);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("reports a failed update", async () => {
    signedIn({});
    updateUser.mockResolvedValue({ error: { message: "nope" } });

    const response = await call({ displayName: "Maxi" });

    expect(response.status).toBe(500);
    expect(refreshSession).not.toHaveBeenCalled();
  });
});
