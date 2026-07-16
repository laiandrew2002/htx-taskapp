import type { Developer } from "@/types/developer.types";
import type { Task } from "@/types/task.types";
import { TaskCard } from "./TaskCard";
import { TASK_LIST_HEADER_CLASS } from "./taskListLayout";

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
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className={TASK_LIST_HEADER_CLASS}>
        <p className="text-sm font-semibold text-slate-900">Task Title</p>
        <p className="text-sm font-semibold text-slate-900">Skills</p>
        <p className="hidden text-sm font-semibold text-slate-900 md:block" aria-hidden="true">
          ...
        </p>
        <p className="text-sm font-semibold text-slate-900">Status</p>
        <p className="text-sm font-semibold text-slate-900">Assignee</p>
      </div>

      <div>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} developers={developers} />
        ))}
      </div>
    </div>
  );
}
