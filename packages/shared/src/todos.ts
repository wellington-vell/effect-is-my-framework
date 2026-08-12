import { Schema } from "effect";

export const TodoSchema = Schema.Struct({
  id: Schema.Number,
  title: Schema.String,
  completed: Schema.Boolean,
  createdAt: Schema.DateFromString,
});

export type Todo = typeof TodoSchema.Type;

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
