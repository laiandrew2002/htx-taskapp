import type { CreateTaskInput } from "@/types/task.types";
import type { TaskFormValues } from "@/types/taskForm.types";

export function mapTaskFormToPayload(values: TaskFormValues): CreateTaskInput {
  const payload: CreateTaskInput = {
    title: values.title.trim(),
  };

  if (values.skillIds.length > 0) {
    payload.skillIds = values.skillIds;
  }

  if (values.subtasks.length > 0) {
    payload.subtasks = values.subtasks.map(mapTaskFormToPayload);
  }

  return payload;
}
