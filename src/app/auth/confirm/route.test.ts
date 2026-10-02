import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyOtp = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { verifyOtp } }),
}));

import { GET } from "./route";

function call(query: string) {
  return GET(new NextRequest(`http://localhost:3000/auth/confirm?${query}`));
}

function locationOf(response: Response) {
  const url = new URL(response.headers.get("location") ?? "");
  return url.pathname + url.search;
}

describe("GET /auth/confirm", () => {
  beforeEach(() => {
    verifyOtp.mockReset();
  });

  it("sends a confirmed signup to the start page", async () => {
    verifyOtp.mockResolvedValue({ error: null });

    expect(locationOf(await call("token_hash=abc&type=signup"))).toBe("/");
    expect(verifyOtp).toHaveBeenCalledWith({ type: "signup", token_hash: "abc" });
  });

  it("sends a verified recovery link to the reset-password page", async () => {
    verifyOtp.mockResolvedValue({ error: null });

    expect(locationOf(await call("token_hash=abc&type=recovery"))).toBe("/auth/reset-password");
  });

  it("flags an expired or used signup link instead of silently landing on the start page", async () => {
    verifyOtp.mockResolvedValue({ error: { code: "otp_expired" } });

    expect(locationOf(await call("token_hash=abc&type=signup"))).toBe("/?link_expired=signup");
  });

  it("flags a failed recovery link as such and does not send it to reset-password", async () => {
    verifyOtp.mockResolvedValue({ error: { code: "otp_expired" } });

    expect(locationOf(await call("token_hash=abc&type=recovery"))).toBe("/?link_expired=recovery");
  });

  it("ignores `next` when verification failed", async () => {
    verifyOtp.mockResolvedValue({ error: { code: "otp_expired" } });

    expect(locationOf(await call("token_hash=abc&type=signup&next=/p/xyz"))).toBe(
      "/?link_expired=signup",
    );
  });

  it("does not call Supabase without a token", async () => {
    expect(locationOf(await call(""))).toBe("/");
    expect(verifyOtp).not.toHaveBeenCalled();
  });
});
