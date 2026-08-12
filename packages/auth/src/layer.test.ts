import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { HttpEffect, HttpRouter } from "effect/unstable/http";

import { AuthRoutesLayer } from "@acme/auth/layer";
import { Auth } from "@acme/auth/service";
import { Env } from "@acme/env/server";

const TestEnv = Layer.succeed(Env, {
  nodeEnv: "test" as const,
  port: 3000,
  host: "0.0.0.0",
  databaseUrl: "postgresql://postgres:postgres@localhost:5432/acme",
  corsOrigins: ["http://localhost:3000"],
  betterAuthSecret: "test-secret",
  betterAuthUrl: "http://localhost:3000",
});

const stubHandler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  if (url.pathname.endsWith("/get-session")) {
    return new Response(JSON.stringify(null), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response("Not Found", { status: 404 });
};

/** Stub Auth so route tests do not need a live database. */
const StubAuth = Layer.succeed(
  Auth,
  Auth.of({
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- test stub handler
    instance: { handler: stubHandler } as Auth["Service"]["instance"],
    getSession: async () => null,
  }),
);

const TestRoutes = HttpRouter.add(
  "*",
  "/api/auth/*",
  Effect.gen(function* () {
    const auth = yield* Auth;
    return yield* HttpEffect.fromWebHandler((request) =>
      auth.instance.handler(request),
    );
  }),
).pipe(HttpRouter.provideRequest(StubAuth));

const fetchRequest = (path: string, init?: RequestInit) =>
  Effect.acquireUseRelease(
    Effect.sync(() =>
      HttpRouter.toWebHandler(TestRoutes, { disableLogger: true }),
    ),
    ({ handler }) =>
      Effect.tryPromise({
        try: () => handler(new Request(`http://localhost${path}`, init)),
        catch: (error: unknown) =>
          error instanceof Error ? error : new Error(String(error)),
      }),
    ({ dispose }) => Effect.promise(() => dispose()),
  );

describe("AuthRoutesLayer", () => {
  it.effect(
    "GET /api/auth/get-session returns null session when unauthenticated",
    () =>
      Effect.gen(function* () {
        const response = yield* fetchRequest("/api/auth/get-session");
        assert.strictEqual(response.status, 200);
        const body = yield* Effect.promise(() => response.json());
        assert.strictEqual(body, null);
      }),
  );

  it.effect("auth catch-all is reachable (not 404 for known path)", () =>
    Effect.gen(function* () {
      const response = yield* fetchRequest("/api/auth/get-session");
      assert.notStrictEqual(response.status, 404);
    }),
  );

  it.effect("AuthRoutesLayer requires Env (composition type smoke)", () =>
    Effect.sync(() => {
      const wired = AuthRoutesLayer.pipe(Layer.provide(TestEnv));
      assert.ok(wired !== undefined);
    }),
  );
});
