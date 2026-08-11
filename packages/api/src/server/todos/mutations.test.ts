import { assert, describe, it } from "@effect/vitest";
import { Cause, Effect, Exit, Layer } from "effect";
import { RpcTest } from "effect/unstable/rpc";

import { TodosRpc } from "@acme/api/contracts/rpc/todos";
import { TodosRpcLive } from "@acme/api/server/todos/rpc";
import { Database } from "@acme/db/database";
import type { Todo } from "@acme/db/schema/todos";

const sampleTodo: Todo = {
  id: 1,
  title: "test",
  completed: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

const updateReturning = () =>
  Effect.succeed([
    {
      ...sampleTodo,
      completed: true,
    },
  ]);
const where = () => ({ returning: updateReturning });
const set = () => ({ where });
const updateFn = () => ({ set });

const deleteReturning = () => Effect.succeed([sampleTodo]);
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

describe("todos mutations", () => {
  it.effect("update returns updated todo", () =>
    Effect.gen(function* () {
      const client = yield* RpcTest.makeClient(TodosRpc);
      const updated = yield* client["todos/v1/update"]({
        id: 1,
        completed: true,
      });
      assert.strictEqual(updated.completed, true);
    }).pipe(
      Effect.scoped,
      Effect.provide(TodosRpcLive),
      Effect.provide(MockDatabase),
    ),
  );

  it.effect("delete completes without error", () =>
    Effect.gen(function* () {
      const client = yield* RpcTest.makeClient(TodosRpc);
      yield* client["todos/v1/delete"]({ id: 1 });
    }).pipe(
      Effect.scoped,
      Effect.provide(TodosRpcLive),
      Effect.provide(MockDatabase),
    ),
  );

  it.effect("update returns TodoError for missing id", () =>
    Effect.gen(function* () {
      const client = yield* RpcTest.makeClient(TodosRpc);
      const exit = yield* Effect.exit(
        client["todos/v1/update"]({ id: 999, completed: true }),
      );
      assert.isTrue(Exit.isFailure(exit));
      if (Exit.isFailure(exit)) {
        const error = Cause.findErrorOption(exit.cause);
        assert.isTrue(error._tag === "Some");
        if (error._tag === "Some") {
          assert.strictEqual(error.value._tag, "TodoError");
        }
      }
    }).pipe(
      Effect.scoped,
      Effect.provide(
        TodosRpcLive.pipe(
          Layer.provide(
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- partial drizzle mock for unit tests
            Layer.succeed(Database, {
              update: () => ({
                set: () => ({
                  where: () => ({
                    returning: () => Effect.succeed([]),
                  }),
                }),
              }),
            } as unknown as Database["Service"]),
          ),
        ),
      ),
    ),
  );
});
