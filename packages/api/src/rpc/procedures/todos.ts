import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

export const TodoSchema = Schema.Struct({
  id: Schema.Number,
  title: Schema.String,
  completed: Schema.Boolean,
  createdAt: Schema.DateFromString,
});

export const CreateTodoPayload = Schema.Struct({
  title: Schema.String,
});

export const ListTodosOutput = Schema.Struct({
  todos: Schema.Array(TodoSchema),
});

export class ListTodos extends Rpc.make("todos/v1/list", {
  success: ListTodosOutput,
}) {}

export class CreateTodo extends Rpc.make("todos/v1/create", {
  payload: CreateTodoPayload,
  success: TodoSchema,
}) {}

export class TodosRpc extends RpcGroup.make(ListTodos, CreateTodo) {}
