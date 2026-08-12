import { RpcGroup } from "effect/unstable/rpc";

import { HealthRpc } from "@acme/contracts/rpc/health";
import { TodosRpc } from "@acme/contracts/rpc/todos";

export const AppRpcs = RpcGroup.make().merge(HealthRpc, TodosRpc);
