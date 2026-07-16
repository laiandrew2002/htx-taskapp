import type { FieldErrors, FieldPath } from "react-hook-form";
import type { TaskFormValues } from "@/types/taskForm.types";

function readErrorMessage(error: unknown): string | undefined {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : undefined;
  }

  return undefined;
}

export function getFieldError(
  errors: FieldErrors<TaskFormValues>,
  path: FieldPath<TaskFormValues>,
): string | undefined {
  const segments = String(path).split(".");
  let current: unknown = errors;

  for (const segment of segments) {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return readErrorMessage(current);
}
