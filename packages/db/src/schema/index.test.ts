import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";

import { schema } from "@acme/db/schema";
import { user } from "@acme/db/schema/auth";
import { todos } from "@acme/db/schema/todos";

describe("schema", () => {
  it.effect("exports todos table on schema object", () =>
    Effect.sync(() => {
      assert.strictEqual(schema.todos, todos);
    }),
  );

  it.effect("exports auth user table on schema object", () =>
    Effect.sync(() => {
      assert.strictEqual(schema.user, user);
    }),
  );
});
