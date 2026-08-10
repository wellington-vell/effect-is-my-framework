import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";

import { schema, todos } from "@acme/db/schema";

describe("schema", () => {
  it.effect("exports todos table on schema object", () =>
    Effect.sync(() => {
      assert.strictEqual(schema.todos, todos);
    }),
  );
});
