import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { AppApi } from "@acme/api/http/api";
import { TodosRpc } from "@acme/api/rpc/procedures/todos";
import { createTodo, listTodos } from "@acme/db/queries/todos";

export const list = Effect.gen(function* () {
  const todos = yield* listTodos;
  return { todos };
});

export const create = (input: { readonly title: string }) =>
  createTodo({ title: input.title });

export const TodosHttpLive = HttpApiBuilder.group(AppApi, "todos", (handlers) =>
  handlers
    .handle("list", () => list)
    .handle("create", ({ payload }) => create(payload)),
);

export const TodosRpcLive = TodosRpc.toLayer({
  "todos/v1/list": () => list,
  "todos/v1/create": (payload) => create(payload),
});
