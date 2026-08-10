import { createServer } from "node:http";

import { Env, serverOptions } from "@effect-framework/env/server";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { HttpRouter, HttpServerResponse } from "effect/unstable/http";

const Routes = HttpRouter.use(
  Effect.fn(function* (router) {
    yield* router.add(
      "GET",
      "/",
      Effect.succeed(HttpServerResponse.text("Hello, World!")),
    );
    yield* router.add(
      "GET",
      "/hello",
      Effect.succeed(
        HttpServerResponse.jsonUnsafe({ message: "Hello, World!" }),
      ),
    );
    yield* router.add(
      "GET",
      "/health",
      Effect.succeed(HttpServerResponse.text("ok")),
    );
  }),
);

const HttpServerLive = HttpRouter.serve(Routes).pipe(
  Layer.provide(NodeHttpServer.layerConfig(createServer, serverOptions)),
  Layer.provide(Env.layerWithDotEnv()),
);

NodeRuntime.runMain(Layer.launch(HttpServerLive));
