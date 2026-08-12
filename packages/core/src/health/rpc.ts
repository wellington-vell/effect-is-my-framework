import { HealthRpc } from "@acme/contracts/rpc/health";
import { healthCheck } from "@acme/domain/health";

export const HealthRpcLive = HealthRpc.toLayerHandler(
  "health/v1/healthCheck",
  () => healthCheck,
);
