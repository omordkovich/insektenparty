import { beforeEach, describe, expect, it, vi } from "vitest";

const { getClaims, signOut, deleteUser } = vi.hoisted(() => ({
  getClaims: vi.fn(),
  signOut: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getClaims, signOut } }),
}));
vi.mock("@/repositories/user-repository", () => ({ deleteUser }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { POST } from "./route";

function call(body: unknown) {
  return POST(
    new Request("http://localhost:3000/auth/delete-account", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /auth/delete-account", () => {
  beforeEach(() => {
    getClaims.mockReset();
    signOut.mockReset();
    deleteUser.mockReset();
    signOut.mockResolvedValue({ error: null });
    deleteUser.mockResolvedValue(undefined);
  });

  it("rejects requests without a session", async () => {
    getClaims.mockResolvedValue({ data: null });

    const response = await call({ confirm: true });

    expect(response.status).toBe(401);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("does not delete without an explicit confirmation", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } } });

    expect((await call({})).status).toBe(400);
    expect((await call({ confirm: "true" })).status).toBe(400);
    expect((await call("not json")).status).toBe(400);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("deletes the signed-in user and signs out", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } } });

    const response = await call({ confirm: true });

    expect(response.status).toBe(200);
    expect(deleteUser).toHaveBeenCalledWith("u1");
    expect(signOut).toHaveBeenCalled();
  });

  it("still succeeds when signing out fails (the user is already gone)", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } } });
    signOut.mockRejectedValue(new Error("session not found"));

    const response = await call({ confirm: true });

    expect(response.status).toBe(200);
  });

  it("reports a failed deletion and keeps the session", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } } });
    deleteUser.mockRejectedValue(new Error("db down"));

    const response = await call({ confirm: true });

    expect(response.status).toBe(500);
    expect(signOut).not.toHaveBeenCalled();
  });
});
