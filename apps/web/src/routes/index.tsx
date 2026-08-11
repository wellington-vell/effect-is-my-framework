import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { AsyncResult, AtomRegistry } from "effect/unstable/reactivity";
import { useState } from "react";
import {
  createTodoFn,
  deleteTodoFn,
  todosListAtom,
  updateTodoFn,
} from "@/lib/atoms/todos";

export const Route = createFileRoute("/")({
  loader: ({ context: { registry } }) =>
    Effect.runPromise(AtomRegistry.getResult(registry, todosListAtom)),
  component: TodoApp,
});

function TodoApp() {
  const loaderData = Route.useLoaderData();
  const result = useAtomValue(todosListAtom);
  const value = AsyncResult.isSuccess(result) ? result.value : loaderData;
  const createTodo = useAtomSet(createTodoFn);
  const updateTodo = useAtomSet(updateTodoFn);
  const deleteTodo = useAtomSet(deleteTodoFn);
  const [title, setTitle] = useState("");

  const onSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (trimmed.length === 0) return;
    createTodo({ title: trimmed });
    setTitle("");
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 p-8">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Todos
        </h1>
        <p className="text-muted-foreground text-sm">
          Create, complete, and delete todos via Effect Atom.
        </p>
      </header>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs doing?"
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex-1 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        />
        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          Add
        </button>
      </form>

      {value.todos.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
          No todos yet. Add one above.
        </p>
      ) : (
        <ul className="border-border divide-border divide-y overflow-hidden rounded-lg border">
          {value.todos.map((todo) => (
            <li
              key={todo.id}
              className="bg-card flex items-center gap-3 px-4 py-3"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() =>
                  updateTodo({
                    id: todo.id,
                    completed: !todo.completed,
                  })
                }
                className="accent-primary size-4"
                aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
              />
              <span
                className={
                  todo.completed
                    ? "text-muted-foreground flex-1 text-sm line-through"
                    : "flex-1 text-sm"
                }
              >
                {todo.title}
              </span>
              <button
                type="button"
                onClick={() => deleteTodo({ id: todo.id })}
                className="text-destructive hover:bg-destructive/10 rounded px-2 py-1 text-xs font-medium transition-colors"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
