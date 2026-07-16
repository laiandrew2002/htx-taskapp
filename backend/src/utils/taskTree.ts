import type { CreateTaskInput } from "../types/task.types";
import type { TaskWithRelations } from "./taskMapper";

export function collectSkillIds(input: CreateTaskInput): number[] {
  const ids = new Set<number>();

  function walk(node: CreateTaskInput): void {
    node.skillIds?.forEach((id) => ids.add(id));
    node.subtasks?.forEach(walk);
  }

  walk(input);
  return [...ids];
}

export function dedupeSkillIds(skillIds?: number[]): number[] | undefined {
  if (!skillIds || skillIds.length === 0) {
    return undefined;
  }

  return [...new Set(skillIds)];
}

export function normalizeCreateTaskInput(input: CreateTaskInput): CreateTaskInput {
  return {
    title: input.title.trim(),
    skillIds: dedupeSkillIds(input.skillIds),
    subtasks: input.subtasks?.map(normalizeCreateTaskInput),
  };
}

export function findDescendants(
  rootId: number,
  tasks: TaskWithRelations[],
): TaskWithRelations[] {
  const descendants: TaskWithRelations[] = [];

  const collect = (parentId: number): void => {
    for (const task of tasks) {
      if (task.parentTaskId === parentId) {
        descendants.push(task);
        collect(task.id);
      }
    }
  };

  collect(rootId);
  return descendants;
}

export function developerHasRequiredSkills(
  requiredSkillIds: number[],
  developerSkillIds: number[],
): boolean {
  return requiredSkillIds.every((skillId) => developerSkillIds.includes(skillId));
}
