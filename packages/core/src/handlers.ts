import { Layer } from "effect";

import { AuthHttpLive } from "@acme/core/auth/http";
import { HealthHttpLive } from "@acme/core/health/http";
import { HealthRpcLive } from "@acme/core/health/rpc";
import { TodosHttpLive } from "@acme/core/todos/http";
import { TodosRpcLive } from "@acme/core/todos/rpc";

export const HandlersLayer = Layer.mergeAll(
  AuthHttpLive,
  HealthHttpLive,
  HealthRpcLive,
  TodosHttpLive,
  TodosRpcLive,
);
