import { Effect } from "effect";
import { RpcClient } from "effect/unstable/rpc";
import { rpcRuntime } from "@/lib/atoms/rpc";

import { TodosRpc } from "@acme/api/rpc/procedures/todos";

export const todosListAtom = rpcRuntime.atom(
  RpcClient.make(TodosRpc).pipe(Effect.flatMap((c) => c["todos/v1/list"]())),
);

export const createTodoFn = rpcRuntime.fn(
  (payload: { readonly title: string }, get) =>
    RpcClient.make(TodosRpc).pipe(
      Effect.flatMap((c) => c["todos/v1/create"](payload)),
      Effect.tap(() => Effect.sync(() => get.refresh(todosListAtom))),
    ),
);

export const updateTodoFn = rpcRuntime.fn(
  (
    payload: {
      readonly id: number;
      readonly title?: string;
      readonly completed?: boolean;
    },
    get,
  ) =>
    RpcClient.make(TodosRpc).pipe(
      Effect.flatMap((c) => c["todos/v1/update"](payload)),
      Effect.tap(() => Effect.sync(() => get.refresh(todosListAtom))),
    ),
);

export const deleteTodoFn = rpcRuntime.fn(
  (payload: { readonly id: number }, get) =>
    RpcClient.make(TodosRpc).pipe(
      Effect.flatMap((c) => c["todos/v1/delete"](payload)),
      Effect.tap(() => Effect.sync(() => get.refresh(todosListAtom))),
    ),
);
