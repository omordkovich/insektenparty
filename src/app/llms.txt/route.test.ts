import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("/llms.txt", () => {
  it("lists the occasion pages in German and English", async () => {
    const text = await GET().text();
    expect(text).toContain("(https://gastzilla.de/einladung): ");
    expect(text).toContain("(https://gastzilla.de/einladung/kindergeburtstag): ");
    expect(text).toContain("(https://gastzilla.de/en/invitations): ");
    expect(text).toContain("(https://gastzilla.de/en/invitations/kids-birthday-party): ");
  });
});
