import { describe, expect, it } from "vitest";
import { isSafeRelativePath } from "./redirect";

describe("isSafeRelativePath", () => {
  it("accepts same-site paths", () => {
    expect(isSafeRelativePath("/")).toBe(true);
    expect(isSafeRelativePath("/event/xyz")).toBe(true);
  });

  it("rejects anything that could leave the site", () => {
    expect(isSafeRelativePath("//evil.example")).toBe(false);
    expect(isSafeRelativePath("https://evil.example")).toBe(false);
    expect(isSafeRelativePath("evil")).toBe(false);
    expect(isSafeRelativePath("/\\evil.example")).toBe(false);
  });
});
