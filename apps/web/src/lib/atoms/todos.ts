import { TodosClient } from "@/lib/atoms/rpc";
import { withToast } from "@/lib/atoms/with-toast";

const todosReactivityKey = ["todos"] as const;

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
      withToast(),
    ),
  { reactivityKeys: todosReactivityKey },
);

export const deleteTodoFn = TodosClient.runtime.fn(
  (payload: { readonly id: number }) =>
    TodosClient.use((client) => client("todos/v1/delete", payload)).pipe(
      withToast(),
    ),
  { reactivityKeys: todosReactivityKey },
);
