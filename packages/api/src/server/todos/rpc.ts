import { Effect, Layer } from "effect";

import { TodosRpc } from "@acme/api/contracts/rpc/todos";
import { TodoError } from "@acme/api/domain/todo-errors";
import { Todos } from "@acme/api/domain/todos";

const wrapTodoError = <A, R>(
  self: Effect.Effect<
    A,
    import("@acme/api/domain/todo-errors").TodoNotFound,
    R
  >,
) => self.pipe(Effect.mapError((reason) => new TodoError({ reason })));

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
