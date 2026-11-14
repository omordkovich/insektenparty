import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

// The normal path refreshes the Supabase session - not needed here; the
// mock just returns the response the proxy asks for.
vi.mock("@/lib/supabase/proxy", () => ({
  updateSession: vi.fn(async (_request: unknown, createResponse: () => Response) => createResponse()),
}));

const { config, isIntlPath, proxy } = await import("./proxy");

function request(url: string, headers: Record<string, string> = {}) {
  return new NextRequest(url, { headers: { host: new URL(url).host, ...headers } });
}

const EN_COOKIE = { cookie: "NEXT_LOCALE=en" };

describe("proxy – under construction", () => {
  afterEach(() => {
    delete process.env.MAINTENANCE_MODE;
  });

  it("answers gastzilla.de with the 503 placeholder when switched on", async () => {
    process.env.MAINTENANCE_MODE = "true";
    const response = await proxy(request("https://gastzilla.de/"));
    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("3600");
    expect(await response.text()).toContain("Hier wird gerade gebaut");
  });

  it("answers before any language redirect", async () => {
    process.env.MAINTENANCE_MODE = "true";
    const response = await proxy(request("https://gastzilla.de/", EN_COOKIE));
    expect(response.status).toBe(503);
  });

  it("still serves the Impressum and event pages on gastzilla.de", async () => {
    process.env.MAINTENANCE_MODE = "true";
    expect((await proxy(request("https://gastzilla.de/impressum"))).status).toBe(200);
    expect((await proxy(request("https://gastzilla.de/en/impressum"))).status).toBe(200);
    expect((await proxy(request("https://gastzilla.de/event/milans7BD"))).status).toBe(200);
  });

  it("serves the real app on Vercel deployment URLs", async () => {
    process.env.MAINTENANCE_MODE = "true";
    const response = await proxy(request("https://mordkovich-e4q1mri6k-omordkovichs-projects.vercel.app/"));
    expect(response.status).toBe(200);
  });

  it("serves the real app when switched off", async () => {
    const response = await proxy(request("https://gastzilla.de/"));
    expect(response.status).toBe(200);
  });
});

describe("proxy – language", () => {
  it("sends a visitor who chose English from / to /en", async () => {
    const response = await proxy(request("https://gastzilla.de/", EN_COOKIE));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/en");
  });

  it("serves /en without a redirect", async () => {
    const response = await proxy(request("https://gastzilla.de/en"));
    expect(response.headers.get("location")).toBeNull();
    // Already matches [locale] - next-intl passes it through unchanged.
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("serves German pages without prefix (internally /de/…)", async () => {
    const response = await proxy(request("https://gastzilla.de/impressum", { "accept-language": "de" }));
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toContain("/de/impressum");
  });

  it.each(["/auth/callback?code=x", "/api/events", "/event/milans7BD", "/llms.txt", "/.well-known/ard.json"])(
    "never redirects or rewrites %s",
    async (path) => {
      const response = await proxy(request(`https://gastzilla.de${path}`, EN_COOKIE));
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    },
  );
});

describe("proxy – occasion pages in the other language", () => {
  async function follow(url: string, headers: Record<string, string> = {}) {
    const hops: string[] = [];
    let response = await proxy(request(url, headers));
    while (response.status >= 300 && response.status < 400) {
      const location = new URL(response.headers.get("location")!, url);
      hops.push(location.pathname + location.search);
      response = await proxy(request(location.href, headers));
    }
    return { status: response.status, hops };
  }

  it("sends the English frame of a German occasion URL to the English page", async () => {
    const response = await proxy(request("https://gastzilla.de/en/einladung/hochzeit?x=1"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://gastzilla.de/en/invitations/wedding?x=1");
    expect((await proxy(request("https://gastzilla.de/en/einladung"))).headers.get("location")).toBe(
      "https://gastzilla.de/en/invitations",
    );
  });

  it("brings a visitor who chose English from a German occasion page to the English one", async () => {
    const { status, hops } = await follow("https://gastzilla.de/einladung/hochzeit", EN_COOKIE);
    expect(status).toBe(200);
    expect(hops.at(-1)).toBe("/en/invitations/wedding");
  });

  it("adds the missing /en to English occasion URLs", async () => {
    const response = await proxy(request("https://gastzilla.de/invitations/wedding"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://gastzilla.de/en/invitations/wedding");
  });

  it("puts another language's occasion URL under an explicit prefix into that prefix's language", async () => {
    const response = await proxy(request("https://gastzilla.de/de/invitations/wedding"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://gastzilla.de/einladung/hochzeit");
  });

  it("leaves German occasion pages alone for German visitors", async () => {
    expect((await proxy(request("https://gastzilla.de/einladung/hochzeit"))).status).toBe(200);
  });
});

describe("isIntlPath", () => {
  it("covers pages but not route handlers or event pages", () => {
    expect(isIntlPath("/")).toBe(true);
    expect(isIntlPath("/auth/reset-password")).toBe(true);
    expect(isIntlPath("/en/impressum")).toBe(true);
    expect(isIntlPath("/auth/callback")).toBe(false);
    expect(isIntlPath("/api/events")).toBe(false);
    expect(isIntlPath("/event/abc")).toBe(false);
    expect(isIntlPath("/events")).toBe(true);
    expect(isIntlPath("/sitemap.xml")).toBe(false);
  });
});

describe("proxy matcher", () => {
  it("skips only real image files (escaped dot before the extension)", () => {
    expect(config.matcher[0]).toContain("\\.(?:svg|png");
  });
});
