import { defineConfig } from "drizzle-kit";
import { Config, ConfigProvider, Effect } from "effect";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const rootEnvPath = fileURLToPath(new URL("../../.env", import.meta.url));

const defaultDatabaseUrl = "postgresql://postgres:postgres@localhost:5432/acme";

const fromFile = (() => {
  try {
    return ConfigProvider.fromDotEnvContents(readFileSync(rootEnvPath, "utf8"));
  } catch {
    return ConfigProvider.fromUnknown({});
  }
})();

const provider = ConfigProvider.orElse(ConfigProvider.fromEnv(), fromFile);

const databaseUrl = Effect.runSync(
  Config.string("DATABASE_URL").pipe(
    Config.withDefault(defaultDatabaseUrl),
    Effect.provideService(ConfigProvider.ConfigProvider, provider),
  ),
);

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
