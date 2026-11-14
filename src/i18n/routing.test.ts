import { describe, expect, it } from "vitest";
import { routing } from "./routing";

describe("routing", () => {
  // hreflang comes from pageMetadata only: next-intl's automatic Link header
  // would also point German-only pages at their noindex /en copies.
  it("sends no automatic hreflang Link headers", () => {
    expect(routing.alternateLinks).toBe(false);
  });
});
