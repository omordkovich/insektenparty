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

  it("lists the design pages", async () => {
    const text = await GET().text();
    expect(text).toContain("## Designs");
    expect(text).toContain("(https://gastzilla.de/designs): ");
    expect(text).toContain("(https://gastzilla.de/designs/halloween-friedhof): ");
    expect(text).toContain("(https://gastzilla.de/en/designs): ");
    expect(text).toContain("(https://gastzilla.de/ru/dizajny): ");
  });
});
