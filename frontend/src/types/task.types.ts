import type { Developer } from "./developer.types";
import type { Skill } from "./skill.types";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  skills: Skill[];
  assignedDeveloper: Developer | null;
  subtasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  skillIds?: number[];
  subtasks?: CreateTaskInput[];
}

export interface UpdateTaskInput {
  status?: TaskStatus;
  assignedDeveloperId?: number | null;
}

export interface CreateTaskResult {
  task: Task;
  warnings: string[];
}
