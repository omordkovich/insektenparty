// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveEntitlements, type UserEntitlements } from "@/lib/features";
import {
  clearStartIntent,
  parseStartIntent,
  readStartIntent,
  saveStartIntent,
  startHref,
  startView,
} from "@/lib/start-intent";

// Minimal in-memory localStorage (the tests run without a DOM).
function installStorage() {
  const store = new Map<string, string>();
  (globalThis as { localStorage?: Storage }).localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => void store.set(key, String(value)),
    removeItem: (key) => void store.delete(key),
    clear: () => store.clear(),
    key: (index) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
  };
}

const MINUTE = 60_000;

function entitlements(overrides: Partial<UserEntitlements>): UserEntitlements {
  return { ...resolveEntitlements([]), ...overrides };
}

describe("parseStartIntent", () => {
  it("reads design and paid event from the URL", () => {
    expect(parseStartIntent({ design: "halloweengraveyard", event: "paid" })).toEqual({ theme: "halloweengraveyard", paid: true });
    expect(parseStartIntent({ design: "foam" })).toEqual({ theme: "foam", paid: false });
  });

  it("accepts colour designs", () => {
    expect(parseStartIntent({ design: "weiss" })).toEqual({ theme: "weiss", paid: false });
  });

  it("ignores unknown or missing designs", () => {
    expect(parseStartIntent({ design: "gibtsnicht" })).toBeNull();
    expect(parseStartIntent({})).toBeNull();
    expect(parseStartIntent({ design: ["foam", "disco"] })).toEqual({ theme: "foam", paid: false });
  });
});

describe("startHref", () => {
  it("points at the start page of the language", () => {
    expect(startHref({ theme: "foam", paid: false }, "de")).toBe("/?design=foam");
    expect(startHref({ theme: "foam", paid: true }, "en")).toBe("/en?design=foam&event=paid");
  });
});

describe("saved start intent", () => {
  beforeEach(installStorage);
  afterEach(() => {
    delete (globalThis as { localStorage?: Storage }).localStorage;
  });

  it("survives a login for up to an hour", () => {
    const intent = { theme: "disco" as const, paid: true };
    saveStartIntent(intent, 0);
    expect(readStartIntent(59 * MINUTE)).toEqual(intent);
    expect(readStartIntent(61 * MINUTE)).toBeNull();
  });

  it("is gone after clearing", () => {
    saveStartIntent({ theme: "disco", paid: false }, 0);
    clearStartIntent();
    expect(readStartIntent(0)).toBeNull();
  });

  it("ignores broken or foreign data", () => {
    localStorage.setItem("gastzilla:start-intent", "{kaputt");
    expect(readStartIntent(0)).toBeNull();
    localStorage.setItem("gastzilla:start-intent", JSON.stringify({ theme: "gibtsnicht", paid: false, savedAt: 0 }));
    expect(readStartIntent(0)).toBeNull();
  });

  it("does not throw without storage", () => {
    delete (globalThis as { localStorage?: Storage }).localStorage;
    expect(() => saveStartIntent({ theme: "disco", paid: false })).not.toThrow();
    expect(readStartIntent()).toBeNull();
    expect(() => clearStartIntent()).not.toThrow();
  });
});

describe("startView", () => {
  it("creates the free event with the design", () => {
    expect(startView({ theme: "foam", paid: false }, entitlements({ freeEventAvailable: true, eventCredits: 0 }), false)).toBe("create");
  });

  it("asks to unlock an event when none is left", () => {
    expect(startView({ theme: "foam", paid: false }, entitlements({ freeEventAvailable: false, eventCredits: 0 }), false)).toBe(
      "unlock-credit",
    );
  });

  it("uses a credit for a paid event", () => {
    expect(startView({ theme: "foam", paid: true }, entitlements({ freeEventAvailable: true, eventCredits: 1 }), false)).toBe("create");
  });

  it("asks to buy a paid event without a credit", () => {
    expect(startView({ theme: "foam", paid: true }, entitlements({ freeEventAvailable: true, eventCredits: 0 }), false)).toBe(
      "unlock-credit",
    );
  });

  it("creates once a credit was just bought", () => {
    expect(startView({ theme: "foam", paid: true }, entitlements({ freeEventAvailable: false, eventCredits: 0 }), true)).toBe("create");
  });
});
