import { HealthRpc } from "@acme/api/contracts/rpc/health";
import { healthCheck } from "@acme/api/domain/health";

export const HealthRpcLive = HealthRpc.toLayerHandler(
  "health/v1/healthCheck",
  () => healthCheck,
);
