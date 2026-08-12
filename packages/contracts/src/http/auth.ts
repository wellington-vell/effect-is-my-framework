import { Schema } from "effect";
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
} from "effect/unstable/httpapi";

import { AuthUser, InvalidCredentials, SignInPayload } from "@acme/shared/auth";

export const AuthGroup = HttpApiGroup.make("auth")
  .add(
    HttpApiEndpoint.post("signIn", "/auth/sign-in", {
      payload: SignInPayload,
      success: AuthUser,
      error: InvalidCredentials.pipe(HttpApiSchema.status(401)),
    }),
    HttpApiEndpoint.post("signOut", "/auth/sign-out", {
      success: Schema.Struct({}),
    }),
    HttpApiEndpoint.get("getSession", "/auth/session", {
      success: Schema.NullOr(AuthUser),
    }),
  )
  .prefix("/v1");
