import type { TaskStatus } from "@/types/task.types";
import { Select } from "@/components/ui/Select";
import { TASK_STATUS_OPTIONS } from "./TaskStatusSelect";

export type TaskStatusFilterValue = TaskStatus | "ALL";

interface TaskStatusFilterProps {
  value: TaskStatusFilterValue;
  onChange: (value: TaskStatusFilterValue) => void;
  disabled?: boolean;
}

const FILTER_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  ...TASK_STATUS_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  })),
];

export function TaskStatusFilter({ value, onChange, disabled }: TaskStatusFilterProps) {
  return (
    <Select
      label="Filter by status"
      value={value}
      disabled={disabled}
      options={FILTER_OPTIONS}
      className="md:w-48"
      onChange={(event) => onChange(event.target.value as TaskStatusFilterValue)}
    />
  );
}
