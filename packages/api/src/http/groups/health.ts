import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
} from "effect/unstable/httpapi";

import { HealthCheckOutput } from "@acme/api/rpc/procedures/health";

export const HealthGroup = HttpApiGroup.make("healthCheck")
  .add(
    HttpApiEndpoint.get("healthCheck", "/health-check", {
      success: HealthCheckOutput.pipe(HttpApiSchema.asText()),
    }),
  )
  .prefix("/v1");
