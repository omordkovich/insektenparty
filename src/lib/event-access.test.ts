import { describe, expect, it } from "vitest";
import {
  eventAccessCookieName,
  eventPasswordMatches,
  hasEventAccess,
  signEventAccess,
} from "@/lib/event-access";

const SECRET = "test-secret";
const event = { id: "event-1", ownerId: "owner-1", accessPassword: "Sommer" };

describe("event access cookie", () => {
  it("names the cookie per event", () => {
    expect(eventAccessCookieName("event-1")).toBe("gz_event_event-1");
  });

  it("signs deterministically and differently per event, password and secret", () => {
    const token = signEventAccess("event-1", "Sommer", SECRET);
    expect(token).toBe(signEventAccess("event-1", "Sommer", SECRET));
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(signEventAccess("event-2", "Sommer", SECRET)).not.toBe(token);
    expect(signEventAccess("event-1", "Winter", SECRET)).not.toBe(token);
    expect(signEventAccess("event-1", "Sommer", "other")).not.toBe(token);
  });
});

describe("eventPasswordMatches", () => {
  it("compares after trimming the attempt", () => {
    expect(eventPasswordMatches("Sommer", " Sommer ")).toBe(true);
    expect(eventPasswordMatches("Sommer", "sommer")).toBe(false);
    expect(eventPasswordMatches("Sommer", "")).toBe(false);
  });
});

describe("hasEventAccess", () => {
  const token = signEventAccess(event.id, event.accessPassword, SECRET);

  it("lets everyone into an open event", () => {
    expect(hasEventAccess({ ...event, accessPassword: null }, { secret: null })).toBe(true);
  });

  it("lets the owner in without a cookie", () => {
    expect(hasEventAccess(event, { userId: "owner-1", secret: SECRET })).toBe(true);
  });

  it("accepts a valid cookie only", () => {
    expect(hasEventAccess(event, { token, secret: SECRET })).toBe(true);
    expect(hasEventAccess(event, { userId: "someone-else", secret: SECRET })).toBe(false);
    expect(hasEventAccess(event, { token: `${token}x`, secret: SECRET })).toBe(false);
    expect(hasEventAccess({ ...event, id: "event-2" }, { token, secret: SECRET })).toBe(false);
    expect(hasEventAccess({ ...event, accessPassword: "Winter" }, { token, secret: SECRET })).toBe(false);
  });

  it("stays locked when the secret is missing", () => {
    expect(hasEventAccess(event, { token, secret: null })).toBe(false);
  });
});
