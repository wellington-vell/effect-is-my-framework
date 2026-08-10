import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { RpcTest } from "effect/unstable/rpc";

import { create, list } from "@acme/api/handlers/todos";
import { TodosRpc } from "@acme/api/rpc/procedures/todos";
import { Database } from "@acme/db/database";
import type { Todo } from "@acme/db/schema/index";

const sampleTodo: Todo = {
  id: 1,
  title: "test",
  completed: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

const orderBy = () => Effect.succeed([sampleTodo]);
const from = () => ({ orderBy });
const select = () => ({ from });

const returning = () =>
  Effect.succeed([
    {
      ...sampleTodo,
      title: "created",
    },
  ]);
const values = () => ({ returning });
const insert = () => ({ values });

const MockDatabase = Layer.succeed(
  Database,
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- partial drizzle mock for unit tests
  { select, insert } as unknown as Database["Service"],
);

describe("todos handlers", () => {
  it.effect("list returns todos from Database", () =>
    list.pipe(
      Effect.map((result) => {
        assert.deepStrictEqual(result, { todos: [sampleTodo] });
      }),
      Effect.provide(MockDatabase),
    ),
  );

  it.effect("create inserts and returns todo", () =>
    create({ title: "created" }).pipe(
      Effect.map((result) => {
        assert.strictEqual(result.title, "created");
        assert.strictEqual(result.id, 1);
      }),
      Effect.provide(MockDatabase),
    ),
  );

  it.effect("RpcTest list and create", () =>
    Effect.gen(function* () {
      const client = yield* RpcTest.makeClient(TodosRpc);
      const listed = yield* client["todos/v1/list"]();
      assert.deepStrictEqual(listed, { todos: [sampleTodo] });

      const created = yield* client["todos/v1/create"]({ title: "created" });
      assert.strictEqual(created.title, "created");
    }).pipe(
      Effect.scoped,
      Effect.provide(
        TodosRpc.toLayer({
          "todos/v1/list": () => list,
          "todos/v1/create": (payload) => create(payload),
        }),
      ),
      Effect.provide(MockDatabase),
    ),
  );
});
