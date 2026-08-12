import { HttpApi } from "effect/unstable/httpapi";

import { AuthGroup } from "@acme/contracts/http/auth";
import { HealthGroup } from "@acme/contracts/http/health";
import { TodosGroup } from "@acme/contracts/http/todos";

export const AppApi = HttpApi.make("App")
  .add(AuthGroup)
  .add(HealthGroup)
  .add(TodosGroup)
  .prefix("/api");
