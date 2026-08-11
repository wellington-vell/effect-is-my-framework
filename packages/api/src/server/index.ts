import { Layer } from "effect";

import { HealthHttpLive } from "@acme/api/server/health/http";
import { HealthRpcLive } from "@acme/api/server/health/rpc";
import { TodosHttpLive } from "@acme/api/server/todos/http";
import { TodosRpcLive } from "@acme/api/server/todos/rpc";

export const HandlersLayer = Layer.mergeAll(
  HealthHttpLive,
  HealthRpcLive,
  TodosHttpLive,
  TodosRpcLive,
);
