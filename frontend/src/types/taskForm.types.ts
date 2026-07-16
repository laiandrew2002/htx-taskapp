export interface TaskFormValues {
  title: string;
  skillIds: number[];
  subtasks: TaskFormValues[];
}

export function emptyTaskFormValues(): TaskFormValues {
  return {
    title: "",
    skillIds: [],
    subtasks: [],
  };
}
