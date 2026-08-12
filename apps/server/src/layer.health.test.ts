import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer, type Layer as LayerType } from "effect";
import { HttpRouter } from "effect/unstable/http";

import { Database } from "@acme/db/database";
import { Env } from "@acme/env/server";
import { AppRoutesLayer } from "@acme/server/layer";
import type { Todo } from "@acme/shared/todos";

const TestEnv = Layer.succeed(Env, {
  nodeEnv: "test" as const,
  port: 3000,
  host: "0.0.0.0",
  databaseUrl: "postgresql://postgres:postgres@localhost:5432/acme",
  corsOrigins: ["http://localhost:3000"],
});

const sampleTodo: Todo = {
  id: 1,
  title: "test",
  completed: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

const makeMockDatabase = (options?: {
  readonly updateRows?: ReadonlyArray<Todo>;
  readonly deleteRows?: ReadonlyArray<Todo>;
}) => {
  const updateRows = options?.updateRows ?? [];
  const deleteRows = options?.deleteRows ?? [];

  return Layer.succeed(
    Database,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- test stub
    {
      select: () => ({
        from: () => ({
          orderBy: () => Effect.succeed([sampleTodo]),
        }),
      }),
      update: () => ({
        set: () => ({
          where: () => ({
            returning: () => Effect.succeed(updateRows),
          }),
        }),
      }),
      delete: () => ({
        where: () => ({
          returning: () => Effect.succeed(deleteRows),
        }),
      }),
    } as unknown as Database["Service"],
  );
};

const makeTestAppRoutes = (database: Layer.Layer<Database>) =>
  AppRoutesLayer.pipe(Layer.provide(database), Layer.provide(TestEnv));

const fetchRequest = (
  testAppRoutes: ReturnType<typeof makeTestAppRoutes>,
  path: string,
  init?: RequestInit,
) =>
  Effect.acquireUseRelease(
    Effect.sync(() => {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- merged route layer R inference
      const layer = testAppRoutes as unknown as LayerType.Layer<
        never,
        never,
        HttpRouter.HttpRouter
      >;
      return HttpRouter.toWebHandler(layer, { disableLogger: true });
    }),
    ({ handler }) =>
      Effect.tryPromise({
        try: () => handler(new Request(`http://localhost${path}`, init)),
        catch: (error: unknown) =>
          error instanceof Error ? error : new Error(String(error)),
      }),
    ({ dispose }) => Effect.promise(() => dispose()),
  );

describe("Health endpoints", () => {
  it.effect("GET / returns OK", () =>
    Effect.gen(function* () {
      const testAppRoutes = makeTestAppRoutes(makeMockDatabase());
      const response = yield* fetchRequest(testAppRoutes, "/");
      assert.strictEqual(response.status, 200);
      const text = yield* Effect.promise(() => response.text());
      assert.strictEqual(text, "OK");
    }),
  );

  it.effect("GET /api/v1/health-check returns OK", () =>
    Effect.gen(function* () {
      const testAppRoutes = makeTestAppRoutes(makeMockDatabase());
      const response = yield* fetchRequest(
        testAppRoutes,
        "/api/v1/health-check",
      );
      assert.strictEqual(response.status, 200);
      const text = yield* Effect.promise(() => response.text());
      assert.strictEqual(text, "OK");
    }),
  );
});
