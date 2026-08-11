import { Context, Effect, Layer, Option } from "effect";

import { TodoNotFound } from "@acme/api/domain/todo-errors";
import { Database } from "@acme/db/database";
import {
  createTodo,
  deleteTodo,
  listTodos,
  updateTodo,
} from "@acme/db/queries/todos";
import type { Todo } from "@acme/db/schema/todos";

export class Todos extends Context.Service<
  Todos,
  {
    readonly list: () => Effect.Effect<
      { readonly todos: ReadonlyArray<Todo> },
      never,
      Database
    >;
    readonly create: (input: {
      readonly title: string;
    }) => Effect.Effect<Todo, never, Database>;
    readonly update: (
      id: number,
      input: { readonly title?: string; readonly completed?: boolean },
    ) => Effect.Effect<Todo, TodoNotFound, Database>;
    readonly remove: (
      id: number,
    ) => Effect.Effect<void, TodoNotFound, Database>;
  }
>()("@acme/Todos") {
  static readonly layer = Layer.succeed(
    Todos,
    Todos.of({
      list: () =>
        listTodos.pipe(
          Effect.map((todos) => ({ todos })),
          Effect.orDie,
        ),
      create: (input) => createTodo(input).pipe(Effect.orDie),
      update: (id, input) =>
        updateTodo(id, input).pipe(
          Effect.orDie,
          Effect.flatMap(
            Option.match({
              onNone: () => Effect.fail(new TodoNotFound({ id })),
              onSome: Effect.succeed,
            }),
          ),
        ),
      remove: (id) =>
        deleteTodo(id).pipe(
          Effect.orDie,
          Effect.flatMap((deleted) =>
            deleted ? Effect.void : Effect.fail(new TodoNotFound({ id })),
          ),
        ),
    }),
  );
}
