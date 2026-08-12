import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer, type Layer as LayerType } from "effect";
import { HttpRouter } from "effect/unstable/http";

import { Auth } from "@acme/auth/service";
import { Database } from "@acme/db/database";
import { Env } from "@acme/env/server";
import { AppRoutesLayer } from "@acme/server/layer";
import type { AuthUser } from "@acme/shared/auth";
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

const testUser: AuthUser = {
  id: "user-1",
  email: "admin@acme.com",
  name: "Admin",
};

const makeStubAuth = (sessionUser: AuthUser | null) => {
  const getSession = async () =>
    sessionUser === null
      ? null
      : { user: sessionUser, session: { id: "sess-1" } };

  return Layer.succeed(
    Auth,
    Auth.of({
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- test stub
      instance: {
        handler: async () => new Response("Not Found", { status: 404 }),
        api: {
          getSession,
          signInEmail: async () => {
            throw new Error("not implemented in stub");
          },
          signOut: async () => {
            throw new Error("not implemented in stub");
          },
        },
      } as unknown as Auth["Service"]["instance"],
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- test stub session shape
      getSession: getSession as Auth["Service"]["getSession"],
    }),
  );
};

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

const makeTestAppRoutes = (
  database: Layer.Layer<Database>,
  sessionUser: AuthUser | null = null,
) =>
  AppRoutesLayer.pipe(
    Layer.provide(database),
    Layer.provide(makeStubAuth(sessionUser)),
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

  it.effect("GET /api/v1/health-check returns 401 when unauthenticated", () =>
    Effect.gen(function* () {
      const testAppRoutes = makeTestAppRoutes(makeMockDatabase());
      const response = yield* fetchRequest(
        testAppRoutes,
        "/api/v1/health-check",
      );
      assert.strictEqual(response.status, 401);
    }),
  );

  it.effect(
    "GET /api/v1/health-check returns private payload when authenticated",
    () =>
      Effect.gen(function* () {
        const testAppRoutes = makeTestAppRoutes(makeMockDatabase(), testUser);
        const response = yield* fetchRequest(
          testAppRoutes,
          "/api/v1/health-check",
        );
        assert.strictEqual(response.status, 200);
        const body = yield* Effect.promise(() => response.json());
        assert.deepStrictEqual(body, {
          message: "This is private",
          user: testUser,
        });
      }),
  );
});
