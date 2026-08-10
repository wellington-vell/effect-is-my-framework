import { Layer } from "effect";

import { HealthHttpLive, HealthRpcLive } from "@acme/api/handlers/health";
import { TodosHttpLive, TodosRpcLive } from "@acme/api/handlers/todos";

export const HandlersLayer = Layer.mergeAll(
  HealthHttpLive,
  HealthRpcLive,
  TodosHttpLive,
  TodosRpcLive,
);
