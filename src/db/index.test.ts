import { afterEach, describe, expect, it, vi } from "vitest";
import { getDb } from "./index";

// postgres() connects lazily, so these tests open no connection.
describe("getDb", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // A new client per call opens a new connection pool per query; on Vercel
  // they pile up until the pooler refuses more ("max client connections
  // reached") and random requests fail.
  it("reuses one client in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "postgres://user:pw@localhost:6543/postgres");

    expect(getDb()).toBe(getDb());
  });

  it("starts a new client when the connection string changes", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DATABASE_URL", "postgres://user:old@localhost:6543/postgres");
    const before = getDb();

    vi.stubEnv("DATABASE_URL", "postgres://user:new@localhost:6543/postgres");

    expect(getDb()).not.toBe(before);
  });
});
