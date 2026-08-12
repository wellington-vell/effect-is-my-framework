import { Effect, Layer } from "effect";

import { TodosRpc } from "@acme/contracts/rpc/todos";
import { Todos } from "@acme/domain/todos";
import { TodoError, type TodoNotFound } from "@acme/shared/errors";

const wrapTodoError = <A, R>(self: Effect.Effect<A, TodoNotFound, R>) =>
  self.pipe(Effect.mapError((reason) => new TodoError({ reason })));

export const TodosRpcLive = TodosRpc.toLayer({
  "todos/v1/list": () =>
    Effect.gen(function* () {
      const todos = yield* Todos;
      return yield* todos.list();
    }),
  "todos/v1/create": (payload: { readonly title: string }) =>
    Effect.gen(function* () {
      const todos = yield* Todos;
      return yield* todos.create(payload);
    }),
  "todos/v1/update": (payload: {
    readonly id: number;
    readonly title?: string;
    readonly completed?: boolean;
  }) =>
    Effect.gen(function* () {
      const todos = yield* Todos;
      return yield* wrapTodoError(todos.update(payload.id, payload));
    }),
  "todos/v1/delete": (payload: { readonly id: number }) =>
    Effect.gen(function* () {
      const todos = yield* Todos;
      return yield* wrapTodoError(todos.remove(payload.id));
    }),
}).pipe(Layer.provide(Todos.layer));
