import { TodosClient } from "@/lib/atoms/rpc";

const todosReactivityKey = ["todos"] as const;

export const todosListAtom = TodosClient.query("todos/v1/list", void 0, {
  reactivityKeys: todosReactivityKey,
  serializationKey: "list",
});

export const createTodoFn = TodosClient.runtime.fn(
  (payload: { readonly title: string }) =>
    TodosClient.use((client) => client("todos/v1/create", payload)),
  { reactivityKeys: todosReactivityKey },
);

export const updateTodoFn = TodosClient.runtime.fn(
  (payload: {
    readonly id: number;
    readonly title?: string;
    readonly completed?: boolean;
  }) => TodosClient.use((client) => client("todos/v1/update", payload)),
  { reactivityKeys: todosReactivityKey },
);

export const deleteTodoFn = TodosClient.runtime.fn(
  (payload: { readonly id: number }) =>
    TodosClient.use((client) => client("todos/v1/delete", payload)),
  { reactivityKeys: todosReactivityKey },
);
