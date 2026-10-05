import { beforeEach, describe, expect, it, vi } from "vitest";

const getClaims = vi.fn();
const updateUser = vi.fn();
const refreshSession = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getClaims, updateUser, refreshSession } }),
}));

import { POST } from "./route";

describe("POST /auth/consent", () => {
  beforeEach(() => {
    getClaims.mockReset();
    updateUser.mockReset();
    refreshSession.mockReset();
  });

  it("rejects requests without a session", async () => {
    getClaims.mockResolvedValue({ data: null });

    const response = await POST();

    expect(response.status).toBe(401);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("records the consent and refreshes the session", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "u1", user_metadata: {} } } });
    updateUser.mockResolvedValue({ error: null });
    refreshSession.mockResolvedValue({ error: null });

    const response = await POST();

    expect(response.status).toBe(200);
    expect(updateUser).toHaveBeenCalledWith({
      data: expect.objectContaining({ terms_accepted_at: expect.any(String) }),
    });
    expect(updateUser.mock.calls[0][0].data).not.toHaveProperty("name");
    expect(refreshSession).toHaveBeenCalled();
  });

  it("leaves an existing consent record untouched", async () => {
    getClaims.mockResolvedValue({
      data: { claims: { sub: "u1", user_metadata: { terms_accepted_at: "2026-09-30T10:00:00Z" } } },
    });

    const response = await POST();

    expect(response.status).toBe(200);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("reports a failed update", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "u1", user_metadata: {} } } });
    updateUser.mockResolvedValue({ error: { message: "nope" } });

    const response = await POST();

    expect(response.status).toBe(500);
    expect(refreshSession).not.toHaveBeenCalled();
  });
});
