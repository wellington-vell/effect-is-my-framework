import { Effect } from "effect";
import { HttpEffect, HttpRouter } from "effect/unstable/http";

import { Auth } from "@acme/auth/service";

/**
 * Mounts Better Auth at `/api/auth/*` via the Fetch handler.
 * Provide `Env` (for `Auth.layer`) at the composition root.
 */
export const AuthRoutesLayer = HttpRouter.add(
  "*",
  "/api/auth/*",
  Effect.gen(function* () {
    const auth = yield* Auth;
    return yield* HttpEffect.fromWebHandler((request) =>
      auth.instance.handler(request),
    );
  }),
).pipe(HttpRouter.provideRequest(Auth.layer));
