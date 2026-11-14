import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

type CookieAdapter = {
  setAll: (cookies: { name: string; value: string; options: object }[], headers: Record<string, string>) => void;
};

const createServerClient = vi.fn();
vi.mock("@supabase/ssr", () => ({ createServerClient }));

const { updateSession } = await import("./proxy");

beforeEach(() => {
  createServerClient.mockReset();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "key";
});

describe("updateSession", () => {
  it("puts refreshed session cookies on a freshly created response", async () => {
    createServerClient.mockImplementation((_url: string, _key: string, { cookies }: { cookies: CookieAdapter }) => ({
      auth: {
        getClaims: async () => {
          cookies.setAll([{ name: "sb-x", value: "neu", options: {} }], {});
          return { data: null };
        },
      },
    }));
    const request = new NextRequest("https://gastzilla.de/");
    const responses: NextResponse[] = [];
    const createResponse = vi.fn(() => {
      const response = NextResponse.rewrite(new URL("/de", request.url), { request });
      responses.push(response);
      return response;
    });

    const response = await updateSession(request, createResponse);

    expect(createResponse).toHaveBeenCalledTimes(2);
    expect(response).toBe(responses[1]);
    expect(response.cookies.get("sb-x")?.value).toBe("neu");
    expect(request.cookies.get("sb-x")?.value).toBe("neu");
  });

  it("returns a redirect as it is without touching Supabase", async () => {
    const redirect = NextResponse.redirect("https://gastzilla.de/en", 307);
    const response = await updateSession(new NextRequest("https://gastzilla.de/"), () => redirect);
    expect(response).toBe(redirect);
    expect(createServerClient).not.toHaveBeenCalled();
  });
});
