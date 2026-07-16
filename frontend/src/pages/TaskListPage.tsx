import { TaskList } from "@/components/tasks/TaskList";
import { PageContainer } from "@/components/layout/PageContainer";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useDevelopers } from "@/hooks/useDevelopers";
import { useTasks } from "@/hooks/useTasks";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function TaskListPage() {
  const tasksQuery = useTasks();
  const developersQuery = useDevelopers();

  const isLoading = tasksQuery.isLoading || developersQuery.isLoading;
  const loadError = tasksQuery.error ?? developersQuery.error;

  return (
    <PageContainer title="Tasks">
      {isLoading ? <Spinner label="Loading tasks..." /> : null}

      {loadError ? (
        <Alert
          variant="error"
          title="Failed to load tasks"
          message={getErrorMessage(loadError, "Unable to reach the API.")}
        />
      ) : null}

      {!isLoading && !loadError ? (
        <TaskList tasks={tasksQuery.data ?? []} developers={developersQuery.data ?? []} />
      ) : null}
    </PageContainer>
  );
}
