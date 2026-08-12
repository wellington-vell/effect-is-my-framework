import { Option } from "effect";
import { TodosClient } from "@/lib/atoms/rpc";
import { withToast } from "@/lib/atoms/with-toast";

import { isTodoNotFound } from "@acme/shared/errors";

const todosReactivityKey = ["todos"] as const;

export const todoNotFoundMessage = (error: Option.Option<unknown>) =>
  Option.match(error, {
    onNone: () => "Something went wrong",
    onSome: (e) =>
      isTodoNotFound(e) ? "Todo not found" : "Something went wrong",
  });

export const todosListAtom = TodosClient.query("todos/v1/list", void 0, {
  reactivityKeys: todosReactivityKey,
  serializationKey: "list",
});

export const createTodoFn = TodosClient.runtime.fn(
  (payload: { readonly title: string }) =>
    TodosClient.use((client) => client("todos/v1/create", payload)).pipe(
      withToast(),
    ),
  { reactivityKeys: todosReactivityKey },
);

export const updateTodoFn = TodosClient.runtime.fn(
  (payload: {
    readonly id: number;
    readonly title?: string;
    readonly completed?: boolean;
  }) =>
    TodosClient.use((client) => client("todos/v1/update", payload)).pipe(
      withToast({ onFailure: todoNotFoundMessage }),
    ),
  { reactivityKeys: todosReactivityKey },
);

export const deleteTodoFn = TodosClient.runtime.fn(
  (payload: { readonly id: number }) =>
    TodosClient.use((client) => client("todos/v1/delete", payload)).pipe(
      withToast({ onFailure: todoNotFoundMessage }),
    ),
  { reactivityKeys: todosReactivityKey },
);
