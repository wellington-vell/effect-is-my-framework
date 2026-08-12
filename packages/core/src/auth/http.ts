import { Effect } from "effect";
import { HttpServerRequest, HttpServerResponse } from "effect/unstable/http";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { Auth } from "@acme/auth/service";
import { AppApi } from "@acme/contracts/http/api";
import { type AuthUser, InvalidCredentials } from "@acme/shared/auth";

const toWebHeaders = (headers: Record<string, string | undefined>): Headers => {
  const result = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string") {
      result.set(key, value);
    }
  }
  return result;
};

const jsonWithCookies = (body: unknown, setCookieHeaders: Headers) => {
  const headers = new Headers({ "content-type": "application/json" });
  for (const cookie of setCookieHeaders.getSetCookie()) {
    headers.append("set-cookie", cookie);
  }
  return HttpServerResponse.fromWeb(
    new Response(JSON.stringify(body), { status: 200, headers }),
  );
};

const toAuthUser = (user: {
  id: string;
  email: string;
  name: string;
}): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
});

export const AuthHttpLive = HttpApiBuilder.group(
  AppApi,
  "auth",
  Effect.fn(function* (handlers) {
    const auth = yield* Auth;

    return handlers
      .handle("signIn", ({ payload }) =>
        Effect.gen(function* () {
          const request = yield* HttpServerRequest.HttpServerRequest;
          const response = yield* Effect.tryPromise({
            try: () =>
              auth.instance.api.signInEmail({
                body: {
                  email: payload.email,
                  password: payload.password,
                },
                headers: toWebHeaders(request.headers),
                asResponse: true,
              }),
            catch: () =>
              new InvalidCredentials({
                message: "Invalid email or password",
              }),
          });

          if (!response.ok) {
            return yield* new InvalidCredentials({
              message: "Invalid email or password",
            });
          }

          const body: unknown = yield* Effect.tryPromise({
            try: () => response.json(),
            catch: () =>
              new InvalidCredentials({
                message: "Invalid email or password",
              }),
          });

          const user =
            typeof body === "object" &&
            body !== null &&
            "user" in body &&
            typeof body.user === "object" &&
            body.user !== null &&
            "id" in body.user &&
            "email" in body.user &&
            "name" in body.user &&
            typeof body.user.id === "string" &&
            typeof body.user.email === "string" &&
            typeof body.user.name === "string"
              ? {
                  id: body.user.id,
                  email: body.user.email,
                  name: body.user.name,
                }
              : null;

          if (user === null) {
            return yield* new InvalidCredentials({
              message: "Invalid email or password",
            });
          }

          return jsonWithCookies(toAuthUser(user), response.headers);
        }),
      )
      .handle("signOut", () =>
        Effect.gen(function* () {
          const request = yield* HttpServerRequest.HttpServerRequest;
          const response = yield* Effect.tryPromise({
            try: () =>
              auth.instance.api.signOut({
                headers: toWebHeaders(request.headers),
                asResponse: true,
              }),
            catch: (cause) =>
              cause instanceof Error ? cause : new Error(String(cause)),
          }).pipe(Effect.orDie);

          return jsonWithCookies({}, response.headers);
        }),
      )
      .handle("getSession", () =>
        Effect.gen(function* () {
          const request = yield* HttpServerRequest.HttpServerRequest;
          const session = yield* Effect.promise(() =>
            auth.getSession(toWebHeaders(request.headers)).catch(() => null),
          );

          if (session === null || session === undefined || !session.user) {
            return null;
          }

          return toAuthUser(session.user);
        }),
      );
  }),
);
