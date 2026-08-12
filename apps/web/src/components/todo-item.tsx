import type { Todo } from "@acme/shared/todos";

type TodoItemProps = {
  readonly todo: Todo;
  readonly onToggle: (id: number, completed: boolean) => void;
  readonly onDelete: (id: number) => void;
};

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className="flex items-center gap-3 bg-card px-4 py-3">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id, !todo.completed)}
        className="size-4 accent-primary"
        aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
      />
      <span
        className={
          todo.completed
            ? "flex-1 text-sm text-muted-foreground line-through"
            : "flex-1 text-sm"
        }
      >
        {todo.title}
      </span>
      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        className="rounded px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
      >
        Delete
      </button>
    </li>
  );
}
