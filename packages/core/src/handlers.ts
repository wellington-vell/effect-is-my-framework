import { Layer } from "effect";

import { HealthHttpLive } from "@acme/core/health/http";
import { HealthRpcLive } from "@acme/core/health/rpc";
import { TodosHttpLive } from "@acme/core/todos/http";
import { TodosRpcLive } from "@acme/core/todos/rpc";

export const HandlersLayer = Layer.mergeAll(
  HealthHttpLive,
  HealthRpcLive,
  TodosHttpLive,
  TodosRpcLive,
);
