import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Redirect = { source: string; has?: { type: string; value?: string }[] };

const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8")) as {
  redirects: Redirect[];
};

// The redirect from the old Vercel address to gastzilla.de. Its source is
// "/:path(<pattern>)"; the pattern decides which paths are redirected.
const hostRedirect = config.redirects.find((redirect) =>
  redirect.has?.some((condition) => condition.type === "host" && condition.value === "mordkovich.vercel.app"),
);
const pattern = hostRedirect?.source.match(/^\/:path\((.+)\)$/)?.[1];

function isRedirected(path: string): boolean {
  return new RegExp(`^${pattern}$`).test(path.replace(/^\//, ""));
}

describe("vercel.json host redirect", () => {
  it("exists with a path pattern", () => {
    expect(pattern).toBeDefined();
  });

  it("sends page visits on the old address to gastzilla.de", () => {
    expect(isRedirected("/event/oleg-halloween-52vzjr")).toBe(true);
    expect(isRedirected("/einladung/geburtstag")).toBe(true);
  });

  // fetch() follows a redirect to another origin only with CORS, which the
  // API doesn't send - saving, creating events and the guest list would fail
  // with "Failed to fetch". The auth routes need their own host's cookies.
  it("leaves API and auth requests on the address they were sent to", () => {
    expect(isRedirected("/api/events")).toBe(false);
    expect(isRedirected("/api/events/ad416bcf-9d4d-4bd8-8f63-46e4101e9b4e/guests")).toBe(false);
    expect(isRedirected("/auth/callback")).toBe(false);
    expect(isRedirected("/auth/consent")).toBe(false);
  });

  it("leaves Next.js assets alone", () => {
    expect(isRedirected("/_next/static/chunks/app.js")).toBe(false);
  });
});
