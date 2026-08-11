import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { isTodoNotFound, todoNotFoundMessage } from "@/lib/atoms/todos";

describe("todos", () => {
  describe("isTodoNotFound", () => {
    it("returns true for TodoNotFound errors", () => {
      assert.isTrue(isTodoNotFound({ _tag: "TodoNotFound", id: 1 }));
    });

    it("returns false for other error types", () => {
      assert.isFalse(isTodoNotFound({ _tag: "OtherError" }));
    });

    it("returns false for null", () => {
      assert.isFalse(isTodoNotFound(null));
    });

    it("returns false for primitives", () => {
      assert.isFalse(isTodoNotFound("error"));
      assert.isFalse(isTodoNotFound(42));
    });
  });

  describe("todoNotFoundMessage", () => {
    it("returns 'Todo not found' for TodoNotFound error", () => {
      const result = todoNotFoundMessage(
        Option.some({ _tag: "TodoNotFound", id: 1 }),
      );
      assert.strictEqual(result, "Todo not found");
    });

    it("returns 'Something went wrong' for other errors", () => {
      const result = todoNotFoundMessage(Option.some({ _tag: "OtherError" }));
      assert.strictEqual(result, "Something went wrong");
    });

    it("returns 'Something went wrong' for None", () => {
      const result = todoNotFoundMessage(Option.none());
      assert.strictEqual(result, "Something went wrong");
    });
  });
});
