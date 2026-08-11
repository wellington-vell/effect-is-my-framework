import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import { TodoError } from "@acme/api/domain/todo-errors";

export const TodoSchema = Schema.Struct({
  id: Schema.Number,
  title: Schema.String,
  completed: Schema.Boolean,
  createdAt: Schema.DateFromString,
});

export const CreateTodoPayload = Schema.Struct({
  title: Schema.String,
});

export const UpdateTodoPayload = Schema.Struct({
  title: Schema.optionalKey(Schema.String),
  completed: Schema.optionalKey(Schema.Boolean),
});

export const TodoIdParams = Schema.Struct({
  id: Schema.Number,
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

export class UpdateTodo extends Rpc.make("todos/v1/update", {
  payload: Schema.Struct({
    id: Schema.Number,
    title: Schema.optionalKey(Schema.String),
    completed: Schema.optionalKey(Schema.Boolean),
  }),
  success: TodoSchema,
  error: TodoError,
}) {}

export class DeleteTodo extends Rpc.make("todos/v1/delete", {
  payload: TodoIdParams,
  success: Schema.Void,
  error: TodoError,
}) {}

export class TodosRpc extends RpcGroup.make(
  ListTodos,
  CreateTodo,
  UpdateTodo,
  DeleteTodo,
) {}
