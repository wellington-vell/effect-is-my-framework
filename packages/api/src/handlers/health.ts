import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { AppApi } from "@acme/api/http/api";
import { HealthRpc } from "@acme/api/rpc/procedures/health";

export const healthCheck = Effect.succeed("OK" as const);

export const HealthHttpLive = HttpApiBuilder.group(
  AppApi,
  "healthCheck",
  (handlers) => handlers.handle("healthCheck", () => healthCheck),
);

export const HealthRpcLive = HealthRpc.toLayerHandler(
  "health/v1/healthCheck",
  () => healthCheck,
);
