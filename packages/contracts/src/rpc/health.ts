import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

export const HealthCheckOutput = Schema.Literal("OK");

export class HealthCheck extends Rpc.make("health/v1/healthCheck", {
  success: HealthCheckOutput,
}) {}

export class HealthRpc extends RpcGroup.make(HealthCheck) {}
