import { RpcGroup } from "effect/unstable/rpc";

import { HealthRpc } from "@acme/api/rpc/procedures/health";
import { TodosRpc } from "@acme/api/rpc/procedures/todos";

export const AppRpcs = RpcGroup.make().merge(HealthRpc, TodosRpc);
