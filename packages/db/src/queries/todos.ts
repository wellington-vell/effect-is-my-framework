import { eq } from "drizzle-orm";
import { Effect, Option } from "effect";

import { Database } from "@acme/db/database";
import { type NewTodo, todos } from "@acme/db/schema/todos";

export const listTodos = Effect.gen(function* () {
  const db = yield* Database;
  return yield* db.select().from(todos).orderBy(todos.id);
});

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
  });

export const updateTodo = (
  id: number,
  input: { readonly title?: string; readonly completed?: boolean },
) =>
  Effect.gen(function* () {
    const db = yield* Database;
    const rows = yield* db
      .update(todos)
      .set(input)
      .where(eq(todos.id, id))
      .returning();
    return Option.fromUndefinedOr(rows[0]);
  });

export const deleteTodo = (id: number) =>
  Effect.gen(function* () {
    const db = yield* Database;
    const rows = yield* db.delete(todos).where(eq(todos.id, id)).returning();
    return rows.length > 0;
  });
