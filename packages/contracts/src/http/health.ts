import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
} from "effect/unstable/httpapi";

import { RequireAuth } from "@acme/contracts/http/middleware/auth";
import { PrivateHealthOutput, Unauthorized } from "@acme/shared/auth";

export const HealthGroup = HttpApiGroup.make("healthCheck")
  .add(
    HttpApiEndpoint.get("healthCheck", "/health-check", {
      success: PrivateHealthOutput,
      error: Unauthorized.pipe(HttpApiSchema.status(401)),
    }),
  )
  .middleware(RequireAuth)
  .prefix("/v1");
