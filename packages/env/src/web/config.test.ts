import { assert, describe, it } from "@effect/vitest";
import { ConfigProvider, Effect, Result } from "effect";

import { Env } from "@acme/env/web";

describe("WebEnv config", () => {
  it.effect("parses valid NODE_ENV, WEB_PORT, and VITE_API_BASE_URL", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({
        NODE_ENV: "production",
        WEB_PORT: "4000",
        VITE_API_BASE_URL: "http://localhost:8080",
      });
      const r = yield* Env.config.parse(provider).pipe(Effect.result);
      assert.deepStrictEqual(
        r,
        Result.succeed({
          nodeEnv: "production",
          port: 4000,
          apiBaseUrl: "http://localhost:8080",
        }),
      );
    }),
  );

  it.effect("uses default NODE_ENV when missing", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({
        WEB_PORT: "3000",
        VITE_API_BASE_URL: "http://localhost:3001",
      });
      const r = yield* Env.config.parse(provider).pipe(Effect.result);
      assert.deepStrictEqual(
        r,
        Result.succeed({
          nodeEnv: "development",
          port: 3000,
          apiBaseUrl: "http://localhost:3001",
        }),
      );
    }),
  );

  it.effect("uses default WEB_PORT when missing", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({
        NODE_ENV: "test",
      });
      const r = yield* Env.config.parse(provider).pipe(Effect.result);
      assert.deepStrictEqual(
        r,
        Result.succeed({
          nodeEnv: "test",
          port: 3000,
          apiBaseUrl: "http://localhost:3001",
        }),
      );
    }),
  );

  it.effect("uses default VITE_API_BASE_URL when missing", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({
        NODE_ENV: "development",
        WEB_PORT: "5173",
      });
      const r = yield* Env.config.parse(provider).pipe(Effect.result);
      assert.deepStrictEqual(
        r,
        Result.succeed({
          nodeEnv: "development",
          port: 5173,
          apiBaseUrl: "http://localhost:3001",
        }),
      );
    }),
  );

  it.effect("uses all defaults when empty", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({});
      const r = yield* Env.config.parse(provider).pipe(Effect.result);
      assert.deepStrictEqual(
        r,
        Result.succeed({
          nodeEnv: "development",
          port: 3000,
          apiBaseUrl: "http://localhost:3001",
        }),
      );
    }),
  );

  it.effect("fails on invalid NODE_ENV", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({ NODE_ENV: "staging" });
      const r = yield* Env.config.parse(provider).pipe(
        Effect.mapError((e) => e.cause.message),
        Effect.result,
      );
      assert.deepStrictEqual(
        r,
        Result.fail(
          `Expected "development" | "production" | "test"
  at ["NODE_ENV"]`,
        ),
      );
    }),
  );

  it.effect("fails on non-numeric WEB_PORT", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({ WEB_PORT: "abc" });
      const r = yield* Env.config.parse(provider).pipe(
        Effect.mapError((e) => e.cause.message),
        Effect.result,
      );
      assert.deepStrictEqual(
        r,
        Result.fail(
          `Expected a string representing a finite number
  at ["WEB_PORT"]`,
        ),
      );
    }),
  );

  it.effect("fails on WEB_PORT out of range (too high)", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({ WEB_PORT: "99999" });
      const r = yield* Env.config.parse(provider).pipe(
        Effect.mapError((e) => e.cause.message),
        Effect.result,
      );
      assert.deepStrictEqual(
        r,
        Result.fail(
          `Expected a value between 1 and 65535
  at ["WEB_PORT"]`,
        ),
      );
    }),
  );

  it.effect("fails on WEB_PORT zero", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({ WEB_PORT: "0" });
      const r = yield* Env.config.parse(provider).pipe(
        Effect.mapError((e) => e.cause.message),
        Effect.result,
      );
      assert.deepStrictEqual(
        r,
        Result.fail(
          `Expected a value between 1 and 65535
  at ["WEB_PORT"]`,
        ),
      );
    }),
  );

  it.effect("accepts WEB_PORT at boundary (1)", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({ WEB_PORT: "1" });
      const r = yield* Env.config.parse(provider).pipe(Effect.result);
      assert.deepStrictEqual(
        r,
        Result.succeed({
          nodeEnv: "development",
          port: 1,
          apiBaseUrl: "http://localhost:3001",
        }),
      );
    }),
  );

  it.effect("accepts WEB_PORT at boundary (65535)", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({ WEB_PORT: "65535" });
      const r = yield* Env.config.parse(provider).pipe(Effect.result);
      assert.deepStrictEqual(
        r,
        Result.succeed({
          nodeEnv: "development",
          port: 65535,
          apiBaseUrl: "http://localhost:3001",
        }),
      );
    }),
  );
});
