import { isApiAxiosError } from "@/services/apiClient";
import { isApiErrorResponse } from "@/types/api.types";
import { getErrorMessage } from "./getErrorMessage";

export function isSkillInferenceError(error: unknown): boolean {
  if (!isApiAxiosError(error)) {
    return false;
  }

  const data = error.response?.data;
  return isApiErrorResponse(data) && data.error.code === "SKILL_INFERENCE_FAILED";
}

export function getCreateTaskErrorMessage(error: unknown): {
  title: string;
  message: string;
  requiresSkillSelection: boolean;
} {
  if (isSkillInferenceError(error)) {
    return {
      title: "Please select skills",
      message: getErrorMessage(error),
      requiresSkillSelection: true,
    };
  }

  return {
    title: "Failed to create task",
    message: getErrorMessage(error),
    requiresSkillSelection: false,
  };
}
