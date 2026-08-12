import { Effect, Layer } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { AppApi } from "@acme/contracts/http/api";
import { Todos } from "@acme/domain/todos";

export const TodosHttpLive = HttpApiBuilder.group(
  AppApi,
  "todos",
  Effect.fn(function* (handlers) {
    const todos = yield* Todos;
    return handlers
      .handle("list", () => todos.list())
      .handle("create", ({ payload }) => todos.create(payload))
      .handle("update", ({ params, payload }) =>
        todos.update(params.id, payload),
      )
      .handle("delete", ({ params }) => todos.remove(params.id));
  }),
).pipe(Layer.provide(Todos.layer));
