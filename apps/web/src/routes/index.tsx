import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { AsyncResult, AtomRegistry } from "effect/unstable/reactivity";
import { useState } from "react";
import { TodoItem } from "@/components/todo-item";
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
        <p className="text-sm text-muted-foreground">
          Create, complete, and delete todos via Effect Atom.
        </p>
      </header>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs doing?"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Add
        </button>
      </form>

      {value.todos.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          No todos yet. Add one above.
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {value.todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={(id, completed) => updateTodo({ id, completed })}
              onDelete={(id) => deleteTodo({ id })}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
