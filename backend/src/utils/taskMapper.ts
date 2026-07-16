import type { Prisma } from "@prisma/client";
import type { DeveloperDTO } from "../types/developer.types";
import type { SkillDTO } from "../types/skill.types";
import type { TaskDTO } from "../types/task.types";

export const taskInclude = {
  skills: {
    include: {
      skill: true,
    },
  },
  assignedDeveloper: {
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
  },
} satisfies Prisma.TaskInclude;

export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: typeof taskInclude;
}>;

export function mapSkill(skill: { id: number; name: string }): SkillDTO {
  return {
    id: skill.id,
    name: skill.name,
  };
}

export function mapDeveloper(
  developer: NonNullable<TaskWithRelations["assignedDeveloper"]>,
): DeveloperDTO {
  return {
    id: developer.id,
    name: developer.name,
    skills: developer.skills.map((entry) => mapSkill(entry.skill)),
  };
}

export function mapTaskBase(task: TaskWithRelations): Omit<TaskDTO, "subtasks"> {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    skills: task.skills.map((entry) => mapSkill(entry.skill)),
    assignedDeveloper: task.assignedDeveloper
      ? mapDeveloper(task.assignedDeveloper)
      : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export function buildTaskTree(
  tasks: TaskWithRelations[],
  parentId: number | null,
): TaskDTO[] {
  return tasks
    .filter((task) => task.parentTaskId === parentId)
    .map((task) => ({
      ...mapTaskBase(task),
      subtasks: buildTaskTree(tasks, task.id),
    }));
}

export function buildTaskSubtree(
  tasks: TaskWithRelations[],
  rootId: number,
): TaskDTO | null {
  const root = tasks.find((task) => task.id === rootId);
  if (!root) {
    return null;
  }

  return {
    ...mapTaskBase(root),
    subtasks: buildTaskTree(tasks, rootId),
  };
}
