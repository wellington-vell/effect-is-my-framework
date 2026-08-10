import { eq } from "drizzle-orm";
import { Effect } from "effect";

import { Database } from "@acme/db/database";
import { todos, type NewTodo } from "@acme/db/schema/index";

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
    const row = rows[0];
    if (row === undefined) {
      return yield* Effect.die(new Error("update returned no rows"));
    }
    return row;
  }).pipe(Effect.orDie);

export const deleteTodo = (id: number) =>
  Effect.gen(function* () {
    const db = yield* Database;
    yield* db.delete(todos).where(eq(todos.id, id));
  }).pipe(Effect.orDie);
