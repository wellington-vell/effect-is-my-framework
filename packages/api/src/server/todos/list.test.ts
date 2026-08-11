import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
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
  {
    select,
    insert,
  } as unknown as Database["Service"],
);

describe("todos list", () => {
  it.effect("list returns todos", () =>
    Effect.gen(function* () {
      const client = yield* RpcTest.makeClient(TodosRpc);
      const listed = yield* client["todos/v1/list"]();
      assert.deepStrictEqual(listed, { todos: [sampleTodo] });
    }).pipe(
      Effect.scoped,
      Effect.provide(TodosRpcLive),
      Effect.provide(MockDatabase),
    ),
  );

  it.effect("create returns created todo", () =>
    Effect.gen(function* () {
      const client = yield* RpcTest.makeClient(TodosRpc);
      const created = yield* client["todos/v1/create"]({ title: "created" });
      assert.strictEqual(created.title, "created");
    }).pipe(
      Effect.scoped,
      Effect.provide(TodosRpcLive),
      Effect.provide(MockDatabase),
    ),
  );
});
