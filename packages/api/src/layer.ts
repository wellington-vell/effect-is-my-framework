import { Effect, Layer } from "effect";
import { HttpRouter, HttpServerResponse } from "effect/unstable/http";
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";

import { HandlersLayer } from "@acme/api/handlers";
import { AppApi } from "@acme/api/http/api";
import { AppRpcs } from "@acme/api/rpc/procedures";
import { Env } from "@acme/env/server";

const RoutesLayer = Layer.mergeAll(
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
  HttpRouter.cors(),
).pipe(
  Layer.provide(RpcSerialization.layerNdjson),
  Layer.provideMerge(HandlersLayer),
);

/** Full application layer for NodeHttpServer — includes HttpRouter.serve. */
export const AppLayer = AppRoutesLayer.pipe(HttpRouter.serve);
