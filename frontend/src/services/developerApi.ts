import { apiClient } from "./apiClient";
import type { ApiSuccessResponse } from "@/types/api.types";
import type { Developer } from "@/types/developer.types";

export async function getDevelopers(): Promise<Developer[]> {
  const response = await apiClient.get<ApiSuccessResponse<Developer[]>>("/developers");
  return response.data.data;
}

export async function getDeveloper(id: number): Promise<Developer> {
  const response = await apiClient.get<ApiSuccessResponse<Developer>>(`/developers/${id}`);
  return response.data.data;
}
