import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer, type Layer as LayerType } from "effect";
import { HttpRouter } from "effect/unstable/http";

import { Auth } from "@acme/auth/service";
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
  betterAuthSecret: "test-secret-min-32-characters-long!",
  betterAuthUrl: "http://localhost:3000",
});

const StubAuth = Layer.succeed(
  Auth,
  Auth.of({
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- test stub
    instance: {
      handler: async () => new Response("Not Found", { status: 404 }),
      api: {
        getSession: async () => null,
        signInEmail: async () => {
          throw new Error("not implemented in stub");
        },
        signOut: async () => {
          throw new Error("not implemented in stub");
        },
      },
    } as unknown as Auth["Service"]["instance"],
    getSession: async () => null,
  }),
);

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
  AppRoutesLayer.pipe(
    Layer.provide(database),
    Layer.provide(StubAuth),
    Layer.provide(TestEnv),
  );

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

describe("Todos endpoints", () => {
  it.effect("PATCH /api/v1/todos/:id returns 404 when todo missing", () =>
    Effect.gen(function* () {
      const testAppRoutes = makeTestAppRoutes(
        makeMockDatabase({ updateRows: [] }),
      );
      const response = yield* fetchRequest(testAppRoutes, "/api/v1/todos/999", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      assert.strictEqual(response.status, 404);
    }),
  );

  it.effect("DELETE /api/v1/todos/:id returns 404 when todo missing", () =>
    Effect.gen(function* () {
      const testAppRoutes = makeTestAppRoutes(
        makeMockDatabase({ deleteRows: [] }),
      );
      const response = yield* fetchRequest(testAppRoutes, "/api/v1/todos/999", {
        method: "DELETE",
      });
      assert.strictEqual(response.status, 404);
    }),
  );
});
