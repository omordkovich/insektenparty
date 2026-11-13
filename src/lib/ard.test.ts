import { describe, expect, it } from "vitest";
import { ARD_PATHS, ardManifest } from "@/lib/ard";

// From the ARD entry schema (ards-project/ard-spec, ard-entry.schema.json).
const IDENTIFIER = /^urn:air:[a-zA-Z0-9.-]+(:[a-zA-Z0-9._-]+)+$/;

describe("ardManifest", () => {
  const manifest = ardManifest();

  it("lists at least one entry", () => {
    expect(manifest.entries.length).toBeGreaterThan(0);
  });

  it("gives every entry the fields the ARD schema requires", () => {
    for (const entry of manifest.entries) {
      expect(entry.identifier).toMatch(IDENTIFIER);
      expect(entry.displayName.trim()).not.toBe("");
      expect(entry.type).toMatch(/^[a-z]+\/[a-z0-9.+-]+$/);
      // Exactly one of url / data - we always link.
      expect(entry.url).toMatch(/^https:\/\/gastzilla\.de\//);
      expect(entry).not.toHaveProperty("data");
    }
  });

  it("uses unique identifiers", () => {
    const ids = manifest.entries.map((entry) => entry.identifier);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("offers 2-5 representative queries per entry", () => {
    for (const entry of manifest.entries) {
      expect(entry.representativeQueries.length).toBeGreaterThanOrEqual(2);
      expect(entry.representativeQueries.length).toBeLessThanOrEqual(5);
    }
  });
});

describe("ARD_PATHS", () => {
  it("serves the current path and its predecessor", () => {
    expect(ARD_PATHS).toEqual(["/.well-known/ard.json", "/.well-known/ai-catalog.json"]);
  });
});
