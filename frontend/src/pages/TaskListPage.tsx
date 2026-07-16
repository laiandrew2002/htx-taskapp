import { PageContainer } from "@/components/layout/PageContainer";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useDevelopers } from "@/hooks/useDevelopers";
import { useSkills } from "@/hooks/useSkills";
import { useTasks } from "@/hooks/useTasks";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function TaskListPage() {
  const tasksQuery = useTasks();
  const developersQuery = useDevelopers();
  const skillsQuery = useSkills();

  const isLoading = tasksQuery.isLoading || developersQuery.isLoading || skillsQuery.isLoading;
  const error = tasksQuery.error ?? developersQuery.error ?? skillsQuery.error;

  return (
    <PageContainer
      title="Task List"
      description="View and manage tasks. Full task management UI will be implemented in the next milestone."
    >
      {isLoading ? <Spinner label="Loading application data..." /> : null}
      {error ? (
        <Alert variant="error" title="Failed to load data" message={getErrorMessage(error, "Unable to reach the API.")} />
      ) : null}
      {!isLoading && !error ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Root tasks</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{tasksQuery.data?.length ?? 0}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Developers</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{developersQuery.data?.length ?? 0}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Skills</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{skillsQuery.data?.length ?? 0}</p>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
