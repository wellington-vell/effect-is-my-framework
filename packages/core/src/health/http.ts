import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { AppApi } from "@acme/contracts/http/api";
import { CurrentUser } from "@acme/shared/auth";

export const HealthHttpLive = HttpApiBuilder.group(
  AppApi,
  "healthCheck",
  (handlers) =>
    handlers.handle("healthCheck", () =>
      Effect.gen(function* () {
        const user = yield* CurrentUser;
        return { message: "This is private", user };
      }),
    ),
);
