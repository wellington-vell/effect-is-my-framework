import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import { TodoError } from "@acme/shared/errors";
import {
  CreateTodoPayload,
  ListTodosOutput,
  TodoIdParams,
  TodoSchema,
} from "@acme/shared/todos";

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
