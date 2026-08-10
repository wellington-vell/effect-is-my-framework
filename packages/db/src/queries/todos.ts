import { Effect } from "effect";

import { Database } from "@acme/db/database";
import { todos, type NewTodo } from "@acme/db/schema";

export const listTodos = Effect.gen(function* () {
  const db = yield* Database;
  return yield* db.select().from(todos).orderBy(todos.id);
}).pipe(Effect.orDie);

export const createTodo = (input: Pick<NewTodo, "title">) =>
  Effect.gen(function* () {
    const db = yield* Database;
    const rows = yield* db
      .insert(todos)
      .values({ title: input.title })
      .returning();
    const row = rows[0];
    if (row === undefined) {
      return yield* Effect.die(new Error("insert returned no rows"));
    }
    return row;
  }).pipe(Effect.orDie);
