import { useState } from "react";
import type { Developer } from "@/types/developer.types";
import type { Task, TaskStatus } from "@/types/task.types";
import { useUpdateTask } from "@/hooks/useUpdateTask";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { DeveloperSelect } from "./DeveloperSelect";
import { SkillBadgeList } from "./SkillBadgeList";
import { TASK_ROW_GRID_CLASS } from "./taskListLayout";
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
    <>
      <div className={`${TASK_ROW_GRID_CLASS} border-b border-slate-100 px-4 py-5 last:border-b-0`}>
        <div className="min-w-0" style={{ paddingLeft: depth * 24 }}>
          <p className="text-sm leading-relaxed text-slate-900">{task.title}</p>
        </div>

        <div className="md:pt-0.5">
          <SkillBadgeList skills={task.skills} />
        </div>

        <div className="hidden text-sm text-slate-400 md:block md:pt-1" aria-hidden="true">
          ...
        </div>

        <TaskStatusSelect
          taskId={task.id}
          value={task.status}
          disabled={isUpdating}
          showLabel={false}
          onChange={handleStatusChange}
        />

        <DeveloperSelect
          taskId={task.id}
          value={task.assignedDeveloper?.id ?? null}
          developers={developers}
          disabled={isUpdating}
          error={actionError ?? undefined}
          showLabel={false}
          onChange={handleDeveloperChange}
        />

        {actionError ? (
          <p className="col-span-full text-xs text-red-600">{actionError}</p>
        ) : null}
      </div>

      {task.subtasks.map((subtask) => (
        <TaskCard
          key={subtask.id}
          task={subtask}
          developers={developers}
          depth={depth + 1}
        />
      ))}
    </>
  );
}
