import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

import {
  CreateTodoPayload,
  ListTodosOutput,
  TodoSchema,
} from "@acme/api/rpc/procedures/todos";

export const TodosGroup = HttpApiGroup.make("todos")
  .add(
    HttpApiEndpoint.get("list", "/todos", {
      success: ListTodosOutput,
    }),
    HttpApiEndpoint.post("create", "/todos", {
      payload: CreateTodoPayload,
      success: TodoSchema,
    }),
  )
  .prefix("/todos/v1");
