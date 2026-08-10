import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

import {
  CreateTodoPayload,
  ListTodosOutput,
  TodoSchema,
  UpdateTodoPayload,
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
    HttpApiEndpoint.patch("update", "/todos/:id", {
      params: { id: Schema.Number },
      payload: UpdateTodoPayload,
      success: TodoSchema,
    }),
    HttpApiEndpoint.delete("delete", "/todos/:id", {
      params: { id: Schema.Number },
    }),
  )
  .prefix("/v1");
