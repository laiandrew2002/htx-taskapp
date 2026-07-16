import { TaskCreateForm } from "@/components/tasks/TaskCreateForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useSkills } from "@/hooks/useSkills";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function TaskCreatePage() {
  const skillsQuery = useSkills();

  return (
    <PageContainer
      title="Create Task"
      description="Build nested tasks with optional skills. Leave skills empty to auto-detect with Gemini."
    >
      {skillsQuery.isLoading ? <Spinner label="Loading skills..." /> : null}

      {skillsQuery.error ? (
        <Alert
          variant="error"
          title="Failed to load skills"
          message={getErrorMessage(skillsQuery.error)}
        />
      ) : null}

      {!skillsQuery.isLoading && !skillsQuery.error ? (
        <TaskCreateForm skills={skillsQuery.data ?? []} />
      ) : null}
    </PageContainer>
  );
}
