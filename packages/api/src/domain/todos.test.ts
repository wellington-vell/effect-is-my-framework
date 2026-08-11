import { assert, describe, it } from "@effect/vitest";
import { Cause, Effect, Exit, Layer } from "effect";

import { Todos } from "@acme/api/domain/todos";
import { Database } from "@acme/db/database";
import type { Todo } from "@acme/db/schema/todos";

const sampleTodo: Todo = {
  id: 1,
  title: "test",
  completed: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

const updateReturning = () => Effect.succeed([] as ReadonlyArray<Todo>);
const where = () => ({ returning: updateReturning });
const set = () => ({ where });
const updateFn = () => ({ set });

const deleteReturning = () => Effect.succeed([] as ReadonlyArray<Todo>);
const deleteWhere = () => ({ returning: deleteReturning });
const deleteFn = () => ({ where: deleteWhere });

const MockDatabase = Layer.succeed(
  Database,
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- partial drizzle mock for unit tests
  {
    update: updateFn,
    delete: deleteFn,
  } as unknown as Database["Service"],
);

describe("Todos service", () => {
  it.effect("update fails with TodoNotFound when row missing", () =>
    Effect.gen(function* () {
      const todos = yield* Todos;
      const exit = yield* Effect.exit(todos.update(999, { completed: true }));
      assert.isTrue(Exit.isFailure(exit));
      if (Exit.isFailure(exit)) {
        const error = Cause.findErrorOption(exit.cause);
        assert.isTrue(error._tag === "Some");
        if (error._tag === "Some") {
          assert.strictEqual(error.value._tag, "TodoNotFound");
          assert.strictEqual(error.value.id, 999);
        }
      }
    }).pipe(Effect.provide(Todos.layer), Effect.provide(MockDatabase)),
  );

  it.effect("remove fails with TodoNotFound when row missing", () =>
    Effect.gen(function* () {
      const todos = yield* Todos;
      const exit = yield* Effect.exit(todos.remove(999));
      assert.isTrue(Exit.isFailure(exit));
      if (Exit.isFailure(exit)) {
        const error = Cause.findErrorOption(exit.cause);
        assert.isTrue(error._tag === "Some");
        if (error._tag === "Some") {
          assert.strictEqual(error.value._tag, "TodoNotFound");
        }
      }
    }).pipe(Effect.provide(Todos.layer), Effect.provide(MockDatabase)),
  );

  it.effect("update succeeds when row exists", () =>
    Effect.gen(function* () {
      const todos = yield* Todos;
      const result = yield* todos.update(1, { completed: true });
      assert.strictEqual(result.completed, true);
    }).pipe(
      Effect.provide(Todos.layer),
      Effect.provide(
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- partial drizzle mock for unit tests
        Layer.succeed(Database, {
          update: () => ({
            set: () => ({
              where: () => ({
                returning: () =>
                  Effect.succeed([{ ...sampleTodo, completed: true }]),
              }),
            }),
          }),
        } as unknown as Database["Service"]),
      ),
    ),
  );
});
