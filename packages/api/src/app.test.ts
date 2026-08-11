import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer, type Layer as LayerType } from "effect";
import { HttpRouter } from "effect/unstable/http";

import { AppRoutesLayer } from "@acme/api/layer";
import { Database } from "@acme/db/database";
import { Env } from "@acme/env/server";

const TestEnv = Layer.succeed(Env, {
  nodeEnv: "test" as const,
  port: 3000,
  host: "0.0.0.0",
  databaseUrl: "postgresql://postgres:postgres@localhost:5432/acme",
  corsOrigins: ["http://localhost:3000"],
});

/** Stub Database so AppRoutesLayer can build without a live Postgres. */
const StubDatabase = Layer.succeed(
  Database,
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- test stub
  {} as Database["Service"],
);

const TestAppRoutes = AppRoutesLayer.pipe(
  Layer.provide(StubDatabase),
  Layer.provide(TestEnv),
);

const fetchPath = (path: string) =>
  Effect.acquireUseRelease(
    Effect.sync(() => {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- merged route layer R inference
      const layer = TestAppRoutes as unknown as LayerType.Layer<
        never,
        never,
        HttpRouter.HttpRouter
      >;
      return HttpRouter.toWebHandler(layer, { disableLogger: true });
    }),
    ({ handler }) =>
      Effect.tryPromise({
        try: () => handler(new Request(`http://localhost${path}`)),
        catch: (error: unknown) =>
          error instanceof Error ? error : new Error(String(error)),
      }),
    ({ dispose }) => Effect.promise(() => dispose()),
  );

describe("AppLayer", () => {
  it.effect("GET / returns OK", () =>
    Effect.gen(function* () {
      const response = yield* fetchPath("/");
      assert.strictEqual(response.status, 200);
      const text = yield* Effect.promise(() => response.text());
      assert.strictEqual(text, "OK");
    }),
  );

  it.effect("GET /api/v1/health-check returns OK", () =>
    Effect.gen(function* () {
      const response = yield* fetchPath("/api/v1/health-check");
      assert.strictEqual(response.status, 200);
      const text = yield* Effect.promise(() => response.text());
      assert.strictEqual(text, "OK");
    }),
  );
});
