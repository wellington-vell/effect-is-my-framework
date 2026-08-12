import { assert, describe, it } from "@effect/vitest";
import { ConfigProvider, Effect } from "effect";

import { Env } from "@acme/env/server";

describe("Env.layer", () => {
  it.effect("provides Env service with parsed values", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({
        NODE_ENV: "production",
        PORT: "8080",
        HOST: "localhost",
      });
      const result = yield* Env.config.pipe(
        Effect.provide(ConfigProvider.layer(provider)),
      );
      assert.deepStrictEqual(result, {
        nodeEnv: "production",
        port: 8080,
        host: "localhost",
        databaseUrl: "postgresql://postgres:postgres@localhost:5432/acme",
        corsOrigins: ["http://localhost:3000"],
        betterAuthSecret: "dev-only-change-me-min-32-chars!!",
        betterAuthUrl: "http://localhost:8080",
      });
    }),
  );

  it.effect("provides Env service with defaults", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({});
      const result = yield* Env.config.pipe(
        Effect.provide(ConfigProvider.layer(provider)),
      );
      assert.deepStrictEqual(result, {
        nodeEnv: "development",
        port: 3001,
        host: "0.0.0.0",
        databaseUrl: "postgresql://postgres:postgres@localhost:5432/acme",
        corsOrigins: ["http://localhost:3000"],
        betterAuthSecret: "dev-only-change-me-min-32-chars!!",
        betterAuthUrl: "http://localhost:3001",
      });
    }),
  );
});
