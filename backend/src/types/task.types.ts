import type { DeveloperDTO } from "./developer.types";
import type { SkillDTO } from "./skill.types";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface TaskDTO {
  id: number;
  title: string;
  status: TaskStatus;
  skills: SkillDTO[];
  assignedDeveloper: DeveloperDTO | null;
  subtasks: TaskDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  skillIds?: number[];
  subtasks?: CreateTaskInput[];
}
