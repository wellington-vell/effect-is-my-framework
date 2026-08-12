import { Context, Schema } from "effect";

export const AuthUser = Schema.Struct({
  id: Schema.String,
  email: Schema.String,
  name: Schema.String,
});
export type AuthUser = typeof AuthUser.Type;

export const SignInPayload = Schema.Struct({
  email: Schema.String,
  password: Schema.String,
});
export type SignInPayload = typeof SignInPayload.Type;

export const PrivateHealthOutput = Schema.Struct({
  message: Schema.String,
  user: AuthUser,
});
export type PrivateHealthOutput = typeof PrivateHealthOutput.Type;

export class Unauthorized extends Schema.TaggedError<Unauthorized>()(
  "Unauthorized",
  { message: Schema.String },
  { httpApiStatus: 401 },
) {}

export class InvalidCredentials extends Schema.TaggedError<InvalidCredentials>()(
  "InvalidCredentials",
  { message: Schema.String },
  { httpApiStatus: 401 },
) {}

export class CurrentUser extends Context.Service<CurrentUser, AuthUser>()(
  "@acme/CurrentUser",
) {}
