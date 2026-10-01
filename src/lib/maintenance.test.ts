import { describe, expect, it } from "vitest";
import { maintenanceHtml, shouldShowMaintenance } from "@/lib/maintenance";

describe("shouldShowMaintenance", () => {
  const on = { enabled: "true", host: "gastzilla.de", pathname: "/" };

  it("shows the page on gastzilla.de and www when switched on", () => {
    expect(shouldShowMaintenance(on)).toBe(true);
    expect(shouldShowMaintenance({ ...on, host: "www.gastzilla.de" })).toBe(true);
    expect(shouldShowMaintenance({ ...on, pathname: "/p/milans7BD" })).toBe(true);
    expect(shouldShowMaintenance({ ...on, pathname: "/api/events" })).toBe(true);
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

  it("keeps the legally required pages and crawler files reachable", () => {
    for (const pathname of ["/impressum", "/datenschutz", "/robots.txt", "/favicon.ico"]) {
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
