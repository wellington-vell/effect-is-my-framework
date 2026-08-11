import { HttpApiBuilder } from "effect/unstable/httpapi";

import { AppApi } from "@acme/api/contracts/http/api";
import { healthCheck } from "@acme/api/domain/health";

export const HealthHttpLive = HttpApiBuilder.group(
  AppApi,
  "healthCheck",
  (handlers) => handlers.handle("healthCheck", () => healthCheck),
);
