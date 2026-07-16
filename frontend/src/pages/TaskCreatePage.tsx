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
      description="Build nested tasks with required skills. The creation form will be implemented in the next milestone."
    >
      {skillsQuery.isLoading ? <Spinner label="Loading skills..." /> : null}
      {skillsQuery.error ? (
        <Alert variant="error" title="Failed to load skills" message={getErrorMessage(skillsQuery.error)} />
      ) : null}
      {!skillsQuery.isLoading && !skillsQuery.error ? (
        <Alert variant="info" message={`API connected. ${skillsQuery.data?.length ?? 0} skills available for task creation.`} />
      ) : null}
    </PageContainer>
  );
}
