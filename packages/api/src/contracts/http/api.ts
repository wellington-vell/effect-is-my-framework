import { HttpApi } from "effect/unstable/httpapi";

import { HealthGroup } from "@acme/api/contracts/http/health";
import { TodosGroup } from "@acme/api/contracts/http/todos";

export const AppApi = HttpApi.make("App")
  .add(HealthGroup)
  .add(TodosGroup)
  .prefix("/api");
