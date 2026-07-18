import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import type { Skill } from "@/types/skill.types";
import type { CreateTaskResult } from "@/types/task.types";
import type { TaskFormValues } from "@/types/taskForm.types";
import { emptyTaskFormValues } from "@/types/taskForm.types";
import { useCreateTask } from "@/hooks/useCreateTask";
import { getCreateTaskErrorMessage } from "@/utils/getCreateTaskErrorMessage";
import { mapTaskFormToPayload } from "@/utils/mapTaskForm";
import { Alert } from "@/components/ui/Alert";
import { SkillBadgeList } from "./SkillBadgeList";
import { SubtaskForm } from "./SubtaskForm";

interface TaskCreateFormProps {
  skills: Skill[];
}

function CreatedTaskSummary({ result }: { result: CreateTaskResult }) {
  const renderTask = (task: CreateTaskResult["task"], depth = 0) => (
    <div key={task.id} className="space-y-2" style={{ marginLeft: depth * 16 }}>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="font-medium text-slate-900">{task.title}</p>
        <div className="mt-2">
          <SkillBadgeList skills={task.skills} />
        </div>
      </div>
      {task.subtasks.map((subtask) => renderTask(subtask, depth + 1))}
    </div>
  );

  return (
    <div className="space-y-4">
      <Alert variant="success" title="Task created" message="Your task tree was saved successfully." />

      {result.warnings.length > 0 ? (
        <div className="space-y-2">
          {result.warnings.map((warning) => (
            <Alert key={warning} variant="info" message={warning} />
          ))}
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-slate-700">Created task tree</p>
        {renderTask(result.task)}
      </div>

      <Link
        to="/"
        className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Back to Task List
      </Link>
    </div>
  );
}

export function TaskCreateForm({ skills }: TaskCreateFormProps) {
  const createTaskMutation = useCreateTask();
  const [submitError, setSubmitError] = useState<{ title: string; message: string } | null>(null);
  const [skillSelectionRequired, setSkillSelectionRequired] = useState(false);
  const [createdResult, setCreatedResult] = useState<CreateTaskResult | null>(null);

  const form = useForm<TaskFormValues>({
    defaultValues: emptyTaskFormValues(),
  });

  const onSubmit = async (values: TaskFormValues) => {
    setSubmitError(null);
    setSkillSelectionRequired(false);

    try {
      const payload = mapTaskFormToPayload(values);
      const result = await createTaskMutation.mutateAsync(payload);
      setCreatedResult(result);
    } catch (error) {
      const createTaskError = getCreateTaskErrorMessage(error);
      setSubmitError({ title: createTaskError.title, message: createTaskError.message });
      setSkillSelectionRequired(createTaskError.requiresSkillSelection);
    }
  };

  if (createdResult) {
    return <CreatedTaskSummary result={createdResult} />;
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SubtaskForm
          skills={skills}
          isRoot
          depth={0}
          skillSelectionRequired={skillSelectionRequired}
        />

        {submitError ? (
          <Alert variant="error" title={submitError.title} message={submitError.message} />
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={createTaskMutation.isPending}
            className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createTaskMutation.isPending ? "Creating..." : "Create Task"}
          </button>
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Cancel
          </Link>
        </div>
      </form>
    </FormProvider>
  );
}
