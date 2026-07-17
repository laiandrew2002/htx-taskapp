import { useState } from "react";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskStatusFilter, type TaskStatusFilterValue } from "@/components/tasks/TaskStatusFilter";
import { PageContainer } from "@/components/layout/PageContainer";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useDevelopers } from "@/hooks/useDevelopers";
import { useTasks } from "@/hooks/useTasks";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function TaskListPage() {
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilterValue>("ALL");
  const statusQuery = statusFilter === "ALL" ? undefined : statusFilter;

  const tasksQuery = useTasks(statusQuery);
  const developersQuery = useDevelopers();

  const isInitialLoading =
    (tasksQuery.isLoading && tasksQuery.data === undefined) || developersQuery.isLoading;
  const loadError = tasksQuery.error ?? developersQuery.error;
  const isRefetchingTasks = tasksQuery.isFetching && !tasksQuery.isLoading;

  return (
    <PageContainer title="Tasks">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <TaskStatusFilter
          value={statusFilter}
          disabled={isInitialLoading || Boolean(loadError)}
          onChange={setStatusFilter}
        />
        {isRefetchingTasks ? (
          <p className="text-xs text-slate-500 sm:pb-2">Updating tasks...</p>
        ) : null}
      </div>

      {isInitialLoading ? <Spinner label="Loading tasks..." /> : null}

      {loadError ? (
        <Alert
          variant="error"
          title="Failed to load tasks"
          message={getErrorMessage(loadError, "Unable to reach the API.")}
        />
      ) : null}

      {!isInitialLoading && !loadError ? (
        <TaskList
          tasks={tasksQuery.data ?? []}
          developers={developersQuery.data ?? []}
          statusFilter={statusFilter}
        />
      ) : null}
    </PageContainer>
  );
}
