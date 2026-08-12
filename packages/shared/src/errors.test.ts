import { assert, describe, it } from "@effect/vitest";

import { TodoError, TodoNotFound } from "@acme/shared/errors";

describe("todo-errors", () => {
  it("TodoNotFound carries id", () => {
    const err = new TodoNotFound({ id: 42 });
    assert.strictEqual(err._tag, "TodoNotFound");
    assert.strictEqual(err.id, 42);
  });

  it("TodoError wraps TodoNotFound reason", () => {
    const err = new TodoError({ reason: new TodoNotFound({ id: 1 }) });
    assert.strictEqual(err._tag, "TodoError");
    assert.strictEqual(err.reason._tag, "TodoNotFound");
  });
});
