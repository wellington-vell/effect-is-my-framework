import { Effect, Layer } from "effect";
import { HttpRouter, HttpServerResponse } from "effect/unstable/http";
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";

import { AuthRoutesLayer } from "@acme/auth/layer";
import { AppApi } from "@acme/contracts/http/api";
import { AppRpcs } from "@acme/contracts/rpc/index";
import { HandlersLayer } from "@acme/core/handlers";
import { RequireAuthLive } from "@acme/core/middleware/auth";
import { Env } from "@acme/env/server";

const RoutesLayer = Layer.mergeAll(
  AuthRoutesLayer,
  RpcServer.layerHttp({
    group: AppRpcs,
    path: "/rpc",
    protocol: "http",
  }),
  HttpApiBuilder.layer(AppApi),
  HttpRouter.add("GET", "/", Effect.succeed(HttpServerResponse.text("OK"))),
);

const DocsLayer = Layer.unwrap(
  Effect.gen(function* () {
    const { nodeEnv } = yield* Env;
    return nodeEnv === "production" ? Layer.empty : HttpApiScalar.layer(AppApi);
  }),
);

/** Route layers without HttpRouter.serve — use for in-process toWebHandler tests. */
export const AppRoutesLayer = Layer.mergeAll(
  RoutesLayer,
  DocsLayer,
  Layer.unwrap(
    Effect.gen(function* () {
      const { corsOrigins } = yield* Env;
      return HttpRouter.cors({
        allowedOrigins: corsOrigins,
        allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        // allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
        credentials: true,
        maxAge: 600,
      });
    }),
  ),
).pipe(
  Layer.provide(RpcSerialization.layerNdjson),
  Layer.provideMerge(HandlersLayer),
  Layer.provideMerge(RequireAuthLive),
);

/** Full application layer for NodeHttpServer — includes HttpRouter.serve. */
export const AppLayer = AppRoutesLayer.pipe(HttpRouter.serve);
