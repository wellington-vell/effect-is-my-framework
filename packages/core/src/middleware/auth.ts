import { Effect, Layer } from "effect";
import { HttpServerRequest } from "effect/unstable/http";

import { Auth } from "@acme/auth/service";
import { RequireAuth } from "@acme/contracts/http/middleware/auth";
import { CurrentUser, Unauthorized } from "@acme/shared/auth";

const toWebHeaders = (headers: Record<string, string | undefined>): Headers => {
  const result = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string") {
      result.set(key, value);
    }
  }
  return result;
};

export const RequireAuthLive = Layer.effect(
  RequireAuth,
  Effect.gen(function* () {
    const auth = yield* Auth;

    return (httpEffect) =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;
        const session = yield* Effect.tryPromise({
          try: () => auth.getSession(toWebHeaders(request.headers)),
          catch: () => new Unauthorized({ message: "Authentication failed" }),
        });

        if (session === null || session === undefined || !session.user) {
          return yield* new Unauthorized({
            message: "You must be authenticated",
          });
        }

        return yield* Effect.provideService(httpEffect, CurrentUser, {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        });
      });
  }),
);
