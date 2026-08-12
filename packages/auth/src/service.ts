import { Context, Effect, Layer } from "effect";

import { type AuthInstance, createAuth } from "@acme/auth/auth";
import { Env } from "@acme/env/server";

export type AuthSession = Awaited<
  ReturnType<AuthInstance["api"]["getSession"]>
>;

export class Auth extends Context.Service<
  Auth,
  {
    readonly instance: AuthInstance;
    readonly getSession: (headers: Headers) => Promise<AuthSession>;
  }
>()("@acme/Auth") {
  static readonly layer: Layer.Layer<Auth, never, Env> = Layer.effect(
    Auth,
    Effect.gen(function* () {
      const env = yield* Env;
      const instance = createAuth({
        databaseUrl: env.databaseUrl,
        secret: env.betterAuthSecret,
        baseURL: env.betterAuthUrl,
        trustedOrigins: env.corsOrigins,
      });

      return Auth.of({
        instance,
        getSession: (headers) => instance.api.getSession({ headers }),
      });
    }),
  );
}
