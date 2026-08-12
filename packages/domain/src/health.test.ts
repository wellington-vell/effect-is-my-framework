import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";

import { healthCheck } from "@acme/domain/health";

describe("healthCheck", () => {
  it.effect("returns OK", () =>
    Effect.gen(function* () {
      const result = yield* healthCheck;
      assert.strictEqual(result, "OK");
    }),
  );
});
