import { HttpApi } from "effect/unstable/httpapi";

import { HealthGroup } from "@acme/contracts/http/health";
import { TodosGroup } from "@acme/contracts/http/todos";

export const AppApi = HttpApi.make("App")
  .add(HealthGroup)
  .add(TodosGroup)
  .prefix("/api");
