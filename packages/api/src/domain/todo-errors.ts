import { Schema } from "effect";

export class TodoNotFound extends Schema.TaggedError<TodoNotFound>()(
  "TodoNotFound",
  { id: Schema.Number },
  { httpApiStatus: 404 },
) {}

export class TodoError extends Schema.TaggedError<TodoError>()("TodoError", {
  reason: Schema.Union([TodoNotFound]),
}) {}
