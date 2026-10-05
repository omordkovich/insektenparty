import { describe, expect, it } from "vitest";
import { getAccountName, getSignInMethods } from "./account";

describe("getAccountName", () => {
  it("is the name from the user metadata", () => {
    expect(getAccountName({ name: "Maxi" })).toBe("Maxi");
  });

  it("returns null when there is no usable name", () => {
    expect(getAccountName({})).toBeNull();
    expect(getAccountName({ name: "  " })).toBeNull();
    expect(getAccountName({ name: 42 })).toBeNull();
    expect(getAccountName(undefined)).toBeNull();
  });
});

describe("getSignInMethods", () => {
  it("recognises an email-only account", () => {
    expect(getSignInMethods({ provider: "email", providers: ["email"] })).toEqual({
      hasGoogle: false,
      hasPassword: true,
    });
  });

  it("recognises a Google-only account: no password", () => {
    expect(getSignInMethods({ provider: "google", providers: ["google"] })).toEqual({
      hasGoogle: true,
      hasPassword: false,
    });
  });

  it("recognises an email account with a linked Google identity", () => {
    expect(getSignInMethods({ provider: "email", providers: ["email", "google"] })).toEqual({
      hasGoogle: true,
      hasPassword: true,
    });
  });

  it("falls back to `provider` when `providers` is missing", () => {
    expect(getSignInMethods({ provider: "google" }).hasGoogle).toBe(true);
    expect(getSignInMethods({ provider: "email" }).hasPassword).toBe(true);
  });

  it("treats missing or odd metadata as an email account", () => {
    expect(getSignInMethods(undefined)).toEqual({
      hasGoogle: false,
      hasPassword: true,
    });
    expect(getSignInMethods({ providers: "nope" }).hasGoogle).toBe(false);
  });
});
