import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { AppApi } from "@acme/api/http/api";
import { TodosRpc } from "@acme/api/rpc/procedures/todos";
import {
  createTodo,
  deleteTodo,
  listTodos,
  updateTodo,
} from "@acme/db/queries/todos";

export const list = Effect.gen(function* () {
  const todos = yield* listTodos;
  return { todos };
});

export const create = (input: { readonly title: string }) =>
  createTodo({ title: input.title });

export const update = (
  id: number,
  input: { readonly title?: string; readonly completed?: boolean },
) => updateTodo(id, input);

export const remove = (id: number) => deleteTodo(id);

export const TodosHttpLive = HttpApiBuilder.group(AppApi, "todos", (handlers) =>
  handlers
    .handle("list", () => list)
    .handle("create", ({ payload }) => create(payload))
    .handle("update", ({ params, payload }) => update(params.id, payload))
    .handle("delete", ({ params }) => remove(params.id)),
);

export const TodosRpcLive = TodosRpc.toLayer({
  "todos/v1/list": () => list,
  "todos/v1/create": (payload) => create(payload),
  "todos/v1/update": ({ id, ...payload }) => update(id, payload),
  "todos/v1/delete": ({ id }) => remove(id),
});
