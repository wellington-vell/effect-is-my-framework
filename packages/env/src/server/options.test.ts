import { assert, describe, it } from "@effect/vitest";
import { ConfigProvider, Effect, Result } from "effect";

import { serverOptions } from "@acme/env/server";

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
      assert.deepStrictEqual(r, Result.succeed(3001));
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
