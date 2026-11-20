import { describe, expect, it } from "vitest";
import { LOCALES } from "./config";
import { MESSAGES } from "./messages";

// Flattens nested messages into "a.b.c" → text.
function leaves(obj: object, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") Object.assign(out, leaves(value, path));
    else out[path] = String(value);
  }
  return out;
}

// Top-level ICU argument names ("{count, plural, …}" → "count").
function placeholders(text: string): string[] {
  const names = new Set<string>();
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{") {
      if (depth === 0) {
        const match = /^\{\s*(\w+)/.exec(text.slice(i));
        if (match) names.add(match[1]);
      }
      depth++;
    } else if (text[i] === "}") depth--;
  }
  return [...names].sort();
}

describe("messages", () => {
  const deLeaves = leaves(MESSAGES.de);
  const others = LOCALES.filter((locale) => locale !== "de");

  it.each(others)("%s has exactly the keys of de", (locale) => {
    expect(Object.keys(leaves(MESSAGES[locale])).sort()).toEqual(Object.keys(deLeaves).sort());
  });

  it.each(LOCALES)("no %s value is empty", (locale) => {
    for (const [key, value] of Object.entries(leaves(MESSAGES[locale]))) {
      expect(value.trim(), `${locale}.${key}`).not.toBe("");
    }
  });

  it.each(others)("%s uses the ICU placeholders of de", (locale) => {
    const localeLeaves = leaves(MESSAGES[locale]);
    for (const key of Object.keys(deLeaves)) {
      expect(placeholders(localeLeaves[key] ?? ""), `${locale}.${key}`).toEqual(placeholders(deLeaves[key]));
    }
  });
});

describe("unlock texts", () => {
  // Owner's decision 2026-11-20: prices are shown, never "coming soon".
  it.each(LOCALES)("%s has no 'coming soon' text for purchases", (locale) => {
    expect(Object.keys(leaves(MESSAGES[locale]))).not.toContain("eventDialog.baldVerfugbar");
  });
});
