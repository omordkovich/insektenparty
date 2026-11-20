import { describe, expect, it } from "vitest";
import { signFeedbackToken, verifyFeedbackToken } from "@/lib/feedback-token";

const S = "secret";

describe("feedback tokens", () => {
  it("round-trips", () => {
    const token = signFeedbackToken({ kind: "feedback", id: "e1", exp: "2026-12-19" }, S);
    expect(verifyFeedbackToken(token, "feedback", S, "2026-12-19")).toEqual({ id: "e1" });
  });

  it("rejects a token after its last valid day", () => {
    const token = signFeedbackToken({ kind: "feedback", id: "e1", exp: "2026-12-19" }, S);
    expect(verifyFeedbackToken(token, "feedback", S, "2026-12-20")).toBeNull();
  });

  it("accepts a token without expiry on any day", () => {
    const token = signFeedbackToken({ kind: "moderate", id: "r1" }, S);
    expect(verifyFeedbackToken(token, "moderate", S, "2030-01-01")).toEqual({ id: "r1" });
  });

  it("rejects a token of another kind", () => {
    const token = signFeedbackToken({ kind: "moderate", id: "r1" }, S);
    expect(verifyFeedbackToken(token, "unsubscribe", S, "2026-11-19")).toBeNull();
  });

  it("rejects a tampered payload", () => {
    const token = signFeedbackToken({ kind: "moderate", id: "r1" }, S);
    const [, signature] = token.split(".");
    const forged = `${Buffer.from(JSON.stringify({ k: "moderate", id: "r2" })).toString("base64url")}.${signature}`;
    expect(verifyFeedbackToken(forged, "moderate", S, "2026-11-19")).toBeNull();
  });

  it("rejects a token signed with another secret", () => {
    const token = signFeedbackToken({ kind: "moderate", id: "r1" }, S);
    expect(verifyFeedbackToken(token, "moderate", "x", "2026-11-19")).toBeNull();
  });

  it("rejects garbage", () => {
    for (const token of ["", "abc", "a.b.c", "%%.%%", "e30.", ".abc"]) {
      expect(verifyFeedbackToken(token, "moderate", S, "2026-11-19")).toBeNull();
    }
  });
});
