import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

// The normal path refreshes the Supabase session - not needed here.
vi.mock("@/lib/supabase/proxy", () => ({
  updateSession: vi.fn(async () => new Response("echte Seite", { status: 200 })),
}));

const { proxy } = await import("./proxy");

function request(url: string) {
  return new NextRequest(url, { headers: { host: new URL(url).host } });
}

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

  it("still serves the Impressum and event pages on gastzilla.de", async () => {
    process.env.MAINTENANCE_MODE = "true";
    expect((await proxy(request("https://gastzilla.de/impressum"))).status).toBe(200);
    expect(await (await proxy(request("https://gastzilla.de/event/milans7BD"))).text()).toBe("echte Seite");
  });

  it("serves the real app on Vercel deployment URLs", async () => {
    process.env.MAINTENANCE_MODE = "true";
    const response = await proxy(request("https://mordkovich-e4q1mri6k-omordkovichs-projects.vercel.app/"));
    expect(await response.text()).toBe("echte Seite");
  });

  it("serves the real app when switched off", async () => {
    const response = await proxy(request("https://gastzilla.de/"));
    expect(await response.text()).toBe("echte Seite");
  });
});
