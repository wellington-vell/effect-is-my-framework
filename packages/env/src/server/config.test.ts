import { assert, describe, it } from "@effect/vitest";
import { ConfigProvider, Effect, Result } from "effect";

import { Env } from "@acme/env/server";

describe("Env config", () => {
  it.effect("parses valid NODE_ENV, PORT, and HOST", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({
        NODE_ENV: "production",
        PORT: "8080",
        HOST: "localhost",
      });
      const r = yield* Env.config.parse(provider).pipe(Effect.result);
      assert.deepStrictEqual(
        r,
        Result.succeed({
          nodeEnv: "production",
          port: 8080,
          host: "localhost",
          databaseUrl: "postgresql://postgres:postgres@localhost:5432/acme",
          corsOrigins: ["http://localhost:3000"],
        }),
      );
    }),
  );

  it.effect("uses default NODE_ENV when missing", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({
        PORT: "3000",
        HOST: "0.0.0.0",
      });
      const r = yield* Env.config.parse(provider).pipe(Effect.result);
      assert.deepStrictEqual(
        r,
        Result.succeed({
          nodeEnv: "development",
          port: 3000,
          host: "0.0.0.0",
          databaseUrl: "postgresql://postgres:postgres@localhost:5432/acme",
          corsOrigins: ["http://localhost:3000"],
        }),
      );
    }),
  );

  it.effect("uses default PORT when missing", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({
        NODE_ENV: "test",
        HOST: "localhost",
      });
      const r = yield* Env.config.parse(provider).pipe(Effect.result);
      assert.deepStrictEqual(
        r,
        Result.succeed({
          nodeEnv: "test",
          port: 3001,
          host: "localhost",
          databaseUrl: "postgresql://postgres:postgres@localhost:5432/acme",
          corsOrigins: ["http://localhost:3000"],
        }),
      );
    }),
  );

  it.effect("uses default HOST when missing", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({
        NODE_ENV: "development",
        PORT: "4000",
      });
      const r = yield* Env.config.parse(provider).pipe(Effect.result);
      assert.deepStrictEqual(
        r,
        Result.succeed({
          nodeEnv: "development",
          port: 4000,
          host: "0.0.0.0",
          databaseUrl: "postgresql://postgres:postgres@localhost:5432/acme",
          corsOrigins: ["http://localhost:3000"],
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
          port: 3001,
          host: "0.0.0.0",
          databaseUrl: "postgresql://postgres:postgres@localhost:5432/acme",
          corsOrigins: ["http://localhost:3000"],
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

  it.effect("fails on non-numeric PORT", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({ PORT: "abc" });
      const r = yield* Env.config.parse(provider).pipe(
        Effect.mapError((e) => e.cause.message),
        Effect.result,
      );
      assert.deepStrictEqual(
        r,
        Result.fail(
          `Expected a string representing a finite number
  at ["PORT"]`,
        ),
      );
    }),
  );

  it.effect("fails on PORT out of range (too high)", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({ PORT: "99999" });
      const r = yield* Env.config.parse(provider).pipe(
        Effect.mapError((e) => e.cause.message),
        Effect.result,
      );
      assert.deepStrictEqual(
        r,
        Result.fail(
          `Expected a value between 1 and 65535
  at ["PORT"]`,
        ),
      );
    }),
  );

  it.effect("fails on negative PORT", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({ PORT: "-1" });
      const r = yield* Env.config.parse(provider).pipe(
        Effect.mapError((e) => e.cause.message),
        Effect.result,
      );
      assert.deepStrictEqual(
        r,
        Result.fail(
          `Expected a value between 1 and 65535
  at ["PORT"]`,
        ),
      );
    }),
  );

  it.effect("fails on PORT zero", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({ PORT: "0" });
      const r = yield* Env.config.parse(provider).pipe(
        Effect.mapError((e) => e.cause.message),
        Effect.result,
      );
      assert.deepStrictEqual(
        r,
        Result.fail(
          `Expected a value between 1 and 65535
  at ["PORT"]`,
        ),
      );
    }),
  );

  it.effect("accepts PORT at boundary (1)", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({ PORT: "1" });
      const r = yield* Env.config.parse(provider).pipe(Effect.result);
      assert.deepStrictEqual(
        r,
        Result.succeed({
          nodeEnv: "development",
          port: 1,
          host: "0.0.0.0",
          databaseUrl: "postgresql://postgres:postgres@localhost:5432/acme",
          corsOrigins: ["http://localhost:3000"],
        }),
      );
    }),
  );

  it.effect("accepts PORT at boundary (65535)", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({ PORT: "65535" });
      const r = yield* Env.config.parse(provider).pipe(Effect.result);
      assert.deepStrictEqual(
        r,
        Result.succeed({
          nodeEnv: "development",
          port: 65535,
          host: "0.0.0.0",
          databaseUrl: "postgresql://postgres:postgres@localhost:5432/acme",
          corsOrigins: ["http://localhost:3000"],
        }),
      );
    }),
  );

  it.effect("fails on float PORT", () =>
    Effect.gen(function* () {
      const provider = ConfigProvider.fromUnknown({ PORT: "3000.5" });
      const r = yield* Env.config.parse(provider).pipe(
        Effect.mapError((e) => e.cause.message),
        Effect.result,
      );
      assert.deepStrictEqual(
        r,
        Result.fail(
          `Expected an integer
  at ["PORT"]`,
        ),
      );
    }),
  );
});
