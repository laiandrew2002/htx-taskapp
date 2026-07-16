import { apiClient } from "./apiClient";
import type { ApiSuccessResponse } from "@/types/api.types";
import type { CreateTaskInput, CreateTaskResult, Task, UpdateTaskInput } from "@/types/task.types";

export async function getTasks(): Promise<Task[]> {
  const response = await apiClient.get<ApiSuccessResponse<Task[]>>("/tasks");
  return response.data.data;
}

export async function getTask(id: number): Promise<Task> {
  const response = await apiClient.get<ApiSuccessResponse<Task>>(`/tasks/${id}`);
  return response.data.data;
}

export async function createTask(input: CreateTaskInput): Promise<CreateTaskResult> {
  const response = await apiClient.post<ApiSuccessResponse<CreateTaskResult>>("/tasks", input);
  return response.data.data;
}

export async function updateTask(id: number, input: UpdateTaskInput): Promise<Task> {
  const response = await apiClient.patch<ApiSuccessResponse<Task>>(`/tasks/${id}`, input);
  return response.data.data;
}
