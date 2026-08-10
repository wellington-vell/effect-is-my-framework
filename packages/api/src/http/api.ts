import { HttpApi } from "effect/unstable/httpapi";

import { HealthGroup } from "@acme/api/http/groups/health";
import { TodosGroup } from "@acme/api/http/groups/todos";

export const AppApi = HttpApi.make("App")
  .add(HealthGroup)
  .add(TodosGroup)
  .prefix("/api");
