import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirrors the "@/*" path alias from tsconfig.json.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // next-intl imports "next/server" without a file extension, which plain
    // Node ESM can't resolve - let Vite bundle it instead.
    server: { deps: { inline: ["next-intl"] } },
  },
});
