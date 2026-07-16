import type { Developer } from "@/types/developer.types";
import type { Task } from "@/types/task.types";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  developers: Developer[];
}

export function TaskList({ tasks, developers }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
        <p className="text-sm font-medium text-slate-900">No tasks yet</p>
        <p className="mt-1 text-sm text-slate-500">Create a task to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} developers={developers} />
      ))}
    </div>
  );
}
