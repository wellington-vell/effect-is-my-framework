import { assert, describe, it } from "@effect/vitest";
import { ConfigProvider, Effect } from "effect";

import { Env } from "@acme/env/web";

describe("WebEnv.layer", () => {
  it.effect("provides Env service with parsed values", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({
        NODE_ENV: "production",
        WEB_PORT: "4000",
        VITE_API_BASE_URL: "https://api.example.com",
      });
      const result = yield* Env.config.pipe(
        Effect.provide(ConfigProvider.layer(provider)),
      );
      assert.deepStrictEqual(result, {
        nodeEnv: "production",
        port: 4000,
        apiBaseUrl: "https://api.example.com",
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
        port: 3000,
        apiBaseUrl: "http://localhost:3001",
      });
    }),
  );
});
