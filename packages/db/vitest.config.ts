import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@acme/db": path.join(packageRoot, "src"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
  },
});
