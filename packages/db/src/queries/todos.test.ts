import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer, Option } from "effect";

import { Database } from "@acme/db/database";
import { updateTodo } from "@acme/db/queries/todos";

describe("updateTodo", () => {
  it.effect("returns None when no row updated", () =>
    Effect.gen(function* () {
      const result = yield* updateTodo(999, { completed: true });
      assert.strictEqual(Option.isNone(result), true);
    }).pipe(
      Effect.provide(
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- test stub
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
  );
});
