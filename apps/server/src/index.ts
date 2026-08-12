import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { createServer } from "node:http";

import { Auth } from "@acme/auth/service";
import { DatabaseLayer, runMigrations } from "@acme/db/layer";
import { Env, serverOptions } from "@acme/env/server";
import { AppLayer } from "@acme/server/layer";

const EnvLive = Env.layerWithDotEnv();

const DatabaseLive = DatabaseLayer.pipe(Layer.provide(EnvLive));

const AuthLive = Auth.layer.pipe(Layer.provide(EnvLive));

const HttpServerLive = AppLayer.pipe(
  Layer.provide(NodeHttpServer.layerConfig(createServer, serverOptions)),
  Layer.provide(DatabaseLive),
  Layer.provide(AuthLive),
  Layer.provide(EnvLive),
);

NodeRuntime.runMain(
  Effect.gen(function* () {
    yield* runMigrations.pipe(Effect.provide(DatabaseLive));
    yield* Layer.launch(HttpServerLive);
  }).pipe(Effect.scoped),
);
