import { isApiAxiosError } from "@/services/apiClient";
import { isApiErrorResponse } from "@/types/api.types";

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (isApiAxiosError(error)) {
    const data = error.response?.data;
    if (isApiErrorResponse(data)) {
      return data.error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
