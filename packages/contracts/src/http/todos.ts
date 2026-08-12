import { Schema } from "effect";
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
} from "effect/unstable/httpapi";

import { TodoNotFound } from "@acme/shared/errors";
import {
  CreateTodoPayload,
  ListTodosOutput,
  TodoSchema,
  UpdateTodoPayload,
} from "@acme/shared/todos";

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
      error: TodoNotFound.pipe(HttpApiSchema.status(404)),
    }),
    HttpApiEndpoint.delete("delete", "/todos/:id", {
      params: { id: Schema.Number },
      success: Schema.Void,
      error: TodoNotFound.pipe(HttpApiSchema.status(404)),
    }),
  )
  .prefix("/v1");
