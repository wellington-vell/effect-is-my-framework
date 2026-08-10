import { assert, describe, it } from "@effect/vitest";
import { ConfigProvider, Effect, Result } from "effect";

import { Env, serverOptions } from "@acme/env/server";

describe("Env", () => {
  describe("config", () => {
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
            port: 3000,
            host: "localhost",
            databaseUrl: "postgresql://postgres:postgres@localhost:5432/acme",
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
            host: "0.0.0.0",
            databaseUrl: "postgresql://postgres:postgres@localhost:5432/acme",
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
          host: "0.0.0.0",
          databaseUrl: "postgresql://postgres:postgres@localhost:5432/acme",
        });
      }),
    );
  });

  describe("serverOptions", () => {
    it.effect("has port config", () =>
      Effect.gen(function* () {
        const provider = ConfigProvider.fromUnknown({ PORT: "4000" });
        const r = yield* serverOptions.port.parse(provider).pipe(Effect.result);
        assert.deepStrictEqual(r, Result.succeed(4000));
      }),
    );

    it.effect("has host config", () =>
      Effect.gen(function* () {
        const provider = ConfigProvider.fromUnknown({ HOST: "127.0.0.1" });
        const r = yield* serverOptions.host.parse(provider).pipe(Effect.result);
        assert.deepStrictEqual(r, Result.succeed("127.0.0.1"));
      }),
    );

    it.effect("port uses default when missing", () =>
      Effect.gen(function* () {
        const provider = ConfigProvider.fromUnknown({});
        const r = yield* serverOptions.port.parse(provider).pipe(Effect.result);
        assert.deepStrictEqual(r, Result.succeed(3000));
      }),
    );

    it.effect("host uses default when missing", () =>
      Effect.gen(function* () {
        const provider = ConfigProvider.fromUnknown({});
        const r = yield* serverOptions.host.parse(provider).pipe(Effect.result);
        assert.deepStrictEqual(r, Result.succeed("0.0.0.0"));
      }),
    );
  });
});
