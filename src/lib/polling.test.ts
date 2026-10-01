import { describe, expect, it } from "vitest";
import { isIdle, shouldPoll } from "@/lib/polling";

const IDLE_AFTER = 10 * 60_000;
const NOW = 1_000_000_000;

describe("isIdle", () => {
  it("is not idle right after activity", () => {
    expect(isIdle({ now: NOW, lastActivity: NOW - 5_000, idleAfterMs: IDLE_AFTER })).toBe(false);
  });

  it("is idle once the idle time has passed", () => {
    expect(isIdle({ now: NOW, lastActivity: NOW - IDLE_AFTER - 1, idleAfterMs: IDLE_AFTER })).toBe(true);
  });
});

describe("shouldPoll", () => {
  it("polls a visible tab with recent activity", () => {
    expect(
      shouldPoll({ visible: true, now: NOW, lastActivity: NOW - 1_000, idleAfterMs: IDLE_AFTER }),
    ).toBe(true);
  });

  it("does not poll a hidden tab", () => {
    expect(
      shouldPoll({ visible: false, now: NOW, lastActivity: NOW - 1_000, idleAfterMs: IDLE_AFTER }),
    ).toBe(false);
  });

  it("does not poll a tab nobody has touched for the idle time", () => {
    expect(
      shouldPoll({ visible: true, now: NOW, lastActivity: NOW - IDLE_AFTER - 1, idleAfterMs: IDLE_AFTER }),
    ).toBe(false);
  });
});
