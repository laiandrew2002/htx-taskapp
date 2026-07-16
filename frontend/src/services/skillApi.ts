import { apiClient } from "./apiClient";
import type { ApiSuccessResponse } from "@/types/api.types";
import type { Skill } from "@/types/skill.types";

export async function getSkills(): Promise<Skill[]> {
  const response = await apiClient.get<ApiSuccessResponse<Skill[]>>("/skills");
  return response.data.data;
}
