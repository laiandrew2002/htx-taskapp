import { useState } from "react";
import type { Developer } from "@/types/developer.types";
import type { Task, TaskStatus } from "@/types/task.types";
import { useUpdateTask } from "@/hooks/useUpdateTask";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { DeveloperSelect } from "./DeveloperSelect";
import { SkillBadgeList } from "./SkillBadgeList";
import { TaskStatusSelect } from "./TaskStatusSelect";

interface TaskCardProps {
  task: Task;
  developers: Developer[];
  depth?: number;
}

export function TaskCard({ task, developers, depth = 0 }: TaskCardProps) {
  const updateTaskMutation = useUpdateTask();
  const [actionError, setActionError] = useState<string | null>(null);
  const isUpdating = updateTaskMutation.isPending;

  const handleStatusChange = async (status: TaskStatus) => {
    if (status === task.status) {
      return;
    }

    setActionError(null);

    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        input: { status },
      });
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const handleDeveloperChange = async (assignedDeveloperId: number | null) => {
    const currentDeveloperId = task.assignedDeveloper?.id ?? null;

    if (assignedDeveloperId === currentDeveloperId) {
      return;
    }

    setActionError(null);

    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        input: { assignedDeveloperId },
      });
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  return (
    <article className="space-y-3">
      <div
        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        style={{ marginLeft: depth * 24 }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-base font-medium text-slate-900">{task.title}</h2>
            <div>
              <p className="mb-1 text-xs font-medium text-slate-600">Required Skills</p>
              <SkillBadgeList skills={task.skills} />
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[28rem]">
            <DeveloperSelect
              taskId={task.id}
              value={task.assignedDeveloper?.id ?? null}
              developers={developers}
              disabled={isUpdating}
              error={actionError ?? undefined}
              onChange={handleDeveloperChange}
            />
            <TaskStatusSelect
              taskId={task.id}
              value={task.status}
              disabled={isUpdating}
              onChange={handleStatusChange}
            />
          </div>
        </div>
      </div>

      {task.subtasks.length > 0 ? (
        <div className="space-y-3">
          {task.subtasks.map((subtask) => (
            <TaskCard
              key={subtask.id}
              task={subtask}
              developers={developers}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
