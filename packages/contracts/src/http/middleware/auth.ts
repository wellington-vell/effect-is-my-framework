import { HttpApiMiddleware } from "effect/unstable/httpapi";

import { CurrentUser, Unauthorized } from "@acme/shared/auth";

/**
 * Cookie-session gate: requires a Better Auth session and provides `CurrentUser`.
 */
export class RequireAuth extends HttpApiMiddleware.Service<
  RequireAuth,
  {
    provides: CurrentUser;
  }
>()("@acme/RequireAuth", {
  error: Unauthorized,
}) {}
