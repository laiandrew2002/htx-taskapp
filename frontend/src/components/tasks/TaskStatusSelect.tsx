import type { TaskStatus } from "@/types/task.types";

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

interface TaskStatusSelectProps {
  taskId: number;
  value: TaskStatus;
  disabled?: boolean;
  error?: string;
  showLabel?: boolean;
  onChange: (status: TaskStatus) => void;
}

export function TaskStatusSelect({
  taskId,
  value,
  disabled,
  error,
  showLabel = true,
  onChange,
}: TaskStatusSelectProps) {
  const selectId = `status-${taskId}`;

  return (
    <div className="space-y-1">
      <label
        htmlFor={selectId}
        className={showLabel ? "block text-xs font-medium text-slate-600" : "sr-only"}
      >
        Status
      </label>
      <select
        id={selectId}
        aria-label="Status"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as TaskStatus)}
        className={[
          "w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm",
          "focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200",
          error ? "border-red-300" : "border-slate-300",
          disabled ? "cursor-not-allowed bg-slate-50 text-slate-500" : "",
        ].join(" ")}
      >
        {TASK_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
