import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
  type ArrayPath,
  type FieldPath,
} from "react-hook-form";
import type { Skill } from "@/types/skill.types";
import type { TaskFormValues } from "@/types/taskForm.types";
import { emptyTaskFormValues } from "@/types/taskForm.types";
import { getFieldError } from "@/utils/formErrors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SkillMultiSelect } from "./SkillMultiSelect";

interface SubtaskFormProps {
  skills: Skill[];
  namePrefix?: FieldPath<TaskFormValues>;
  onRemove?: () => void;
  depth?: number;
  isRoot?: boolean;
}

function buildPath(prefix: FieldPath<TaskFormValues> | undefined, field: string): FieldPath<TaskFormValues> {
  if (!prefix) {
    return field as FieldPath<TaskFormValues>;
  }

  return `${prefix}.${field}` as FieldPath<TaskFormValues>;
}

export function SubtaskForm({
  skills,
  namePrefix,
  onRemove,
  depth = 0,
  isRoot = false,
}: SubtaskFormProps) {
  const { control, setValue, formState: { errors } } = useFormContext<TaskFormValues>();

  const titlePath = buildPath(namePrefix, "title");
  const skillIdsPath = buildPath(namePrefix, "skillIds");
  const subtasksPath = buildPath(namePrefix, "subtasks");

  const skillIds = useWatch({
    control,
    name: skillIdsPath,
  }) as number[] | undefined;

  const { fields, append, remove } = useFieldArray({
    control,
    name: subtasksPath as ArrayPath<TaskFormValues>,
  });

  return (
    <div
      className={[
        "space-y-4 rounded-lg border bg-white p-4",
        isRoot ? "border-slate-200 shadow-sm" : "border-slate-200",
      ].join(" ")}
      style={{ marginLeft: depth * 20 }}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">
          {isRoot ? "Root Task" : `Subtask ${depth}`}
        </h3>
        {!isRoot && onRemove ? (
          <Button type="button" variant="danger" onClick={onRemove}>
            Remove
          </Button>
        ) : null}
      </div>

      <Controller
        name={titlePath}
        control={control}
        rules={{
          required: "Title is required",
          validate: (value) =>
            typeof value === "string" && value.trim().length > 0 ? true : "Title is required",
        }}
        render={({ field }) => (
          <Input
            label="Title"
            placeholder="Enter task title"
            error={getFieldError(errors, titlePath)}
            name={field.name}
            value={typeof field.value === "string" ? field.value : ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <SkillMultiSelect
        skills={skills}
        value={skillIds ?? []}
        onChange={(nextSkillIds) =>
          setValue(skillIdsPath, nextSkillIds, { shouldDirty: true, shouldValidate: true })
        }
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">Subtasks</p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => append(emptyTaskFormValues())}
          >
            Add Subtask
          </Button>
        </div>

        {fields.map((field, index) => {
          const nestedPrefix = buildPath(subtasksPath, String(index));

          return (
            <SubtaskForm
              key={field.id}
              skills={skills}
              namePrefix={nestedPrefix}
              depth={depth + 1}
              onRemove={() => remove(index)}
            />
          );
        })}
      </div>
    </div>
  );
}
