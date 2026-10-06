import { describe, expect, it } from "vitest";
import { maintenanceHtml, shouldShowMaintenance } from "@/lib/maintenance";

describe("shouldShowMaintenance", () => {
  const on = { enabled: "true", host: "gastzilla.de", pathname: "/" };

  it("shows the page for the start page and \"Über uns\" on gastzilla.de and www", () => {
    expect(shouldShowMaintenance(on)).toBe(true);
    expect(shouldShowMaintenance({ ...on, host: "www.gastzilla.de" })).toBe(true);
    expect(shouldShowMaintenance({ ...on, pathname: "/about" })).toBe(true);
  });

  it("keeps event pages and everything they need reachable", () => {
    for (const pathname of [
      "/p/milans7BD",
      "/p/milans7BD/info",
      "/p/milans7BD/opengraph-image",
      "/api/events/996439e3-1828-47b4-baf8-8c29bb5bb6b3/guests",
      "/auth/confirm",
      "/auth/reset-password",
      "/opengraph-image",
    ]) {
      expect(shouldShowMaintenance({ ...on, pathname })).toBe(false);
    }
  });

  it("does not treat look-alike paths as event pages", () => {
    expect(shouldShowMaintenance({ ...on, pathname: "/party" })).toBe(true);
    expect(shouldShowMaintenance({ ...on, pathname: "/apix" })).toBe(true);
  });

  it("is off unless MAINTENANCE_MODE is exactly \"true\"", () => {
    expect(shouldShowMaintenance({ ...on, enabled: undefined })).toBe(false);
    expect(shouldShowMaintenance({ ...on, enabled: "false" })).toBe(false);
    expect(shouldShowMaintenance({ ...on, enabled: "" })).toBe(false);
  });

  it("leaves Vercel deployment URLs and localhost alone, for testing", () => {
    expect(shouldShowMaintenance({ ...on, host: "mordkovich-e4q1mri6k-omordkovichs-projects.vercel.app" })).toBe(false);
    expect(shouldShowMaintenance({ ...on, host: "localhost:3000" })).toBe(false);
  });

  it("keeps the legal pages and crawler files reachable", () => {
    for (const pathname of ["/impressum", "/datenschutz", "/agb", "/widerruf", "/robots.txt", "/sitemap.xml", "/llms.txt", "/favicon.ico"]) {
      expect(shouldShowMaintenance({ ...on, pathname })).toBe(false);
    }
  });
});

describe("maintenanceHtml", () => {
  it("is a complete German page with logo, text and legal links", () => {
    const html = maintenanceHtml();
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('<html lang="de">');
    expect(html).toContain("banner_l.webp");
    expect(html).toContain('href="/impressum"');
    expect(html).toContain('href="/datenschutz"');
    expect(html).toContain('<meta name="robots" content="noindex">');
  });
});
