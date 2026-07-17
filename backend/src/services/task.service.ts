import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from "../utils/errors";
import type {
  CreateTaskInput,
  CreateTaskResult,
  TaskDTO,
  UpdateTaskInput,
} from "../types/task.types";
import type { ListTasksQuery } from "../validators/task.validator";
import { taskRepository } from "../repositories/task.repository";
import { skillRepository } from "../repositories/skill.repository";
import { developerRepository } from "../repositories/developer.repository";
import { geminiService } from "./gemini.service";
import { parseGeminiSkillResponse } from "../utils/geminiParser";
import {
  collectSkillIds,
  developerHasRequiredSkills,
  findDescendants,
} from "../utils/taskTree";

export class TaskService {
  constructor(
    private readonly repository = taskRepository,
    private readonly skills = skillRepository,
    private readonly developers = developerRepository,
    private readonly gemini = geminiService,
  ) {}

  async listTasks(query: ListTasksQuery): Promise<TaskDTO[]> {
    return this.repository.findRootTasks(query.status);
  }

  async getTaskById(id: number): Promise<TaskDTO> {
    const task = await this.repository.findTaskTreeById(id);

    if (!task) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }

    return task;
  }

  async createTask(input: CreateTaskInput): Promise<CreateTaskResult> {
    const enrichedInput = await this.enrichWithInferredSkills(input);
    await this.validateSkillIds(enrichedInput);
    const task = await this.repository.createTaskTree(enrichedInput);

    return { task, warnings: [] };
  }

  async updateTask(id: number, input: UpdateTaskInput): Promise<TaskDTO> {
    const task = await this.repository.findByIdWithRelations(id);

    if (!task) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }

    if (input.status === "DONE") {
      await this.ensureAllDescendantsDone(id);
    }

    if (input.assignedDeveloperId !== undefined) {
      await this.validateAssignment(task.skills, input.assignedDeveloperId);
    }

    await this.repository.update(id, input);

    const updatedTask = await this.repository.findTaskTreeById(id);

    if (!updatedTask) {
      throw new Error(`Failed to load updated task with id ${id}`);
    }

    return updatedTask;
  }

  private async enrichWithInferredSkills(input: CreateTaskInput): Promise<CreateTaskInput> {
    const skillIds =
      input.skillIds && input.skillIds.length > 0
        ? input.skillIds
        : await this.inferSkillIdsForTitle(input.title);

    const subtasks = input.subtasks
      ? await Promise.all(
          input.subtasks.map((subtask) => this.enrichWithInferredSkills(subtask)),
        )
      : undefined;

    return {
      title: input.title,
      skillIds,
      subtasks,
    };
  }

  private async inferSkillIdsForTitle(title: string): Promise<number[]> {
    if (!this.gemini.isConfigured()) {
      throw new UnprocessableEntityError(
        `Could not infer skills for task "${title}": GEMINI_API_KEY is not configured`,
      );
    }

    try {
      const rawResponse = await this.gemini.inferSkills(title);
      const skillNames = parseGeminiSkillResponse(rawResponse);

      if (skillNames.length === 0) {
        throw new UnprocessableEntityError(
          `Could not infer skills for task "${title}": unparseable Gemini response "${rawResponse}"`,
        );
      }

      const skills = await this.skills.findByNames(skillNames);

      if (skills.length === 0) {
        throw new UnprocessableEntityError(
          `Could not infer skills for task "${title}": no matching skills found for "${skillNames.join(", ")}"`,
        );
      }

      return skills.map((skill) => skill.id);
    } catch (error) {
      if (error instanceof UnprocessableEntityError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : "Unknown Gemini error";
      throw new UnprocessableEntityError(
        `Could not infer skills for task "${title}": ${message}`,
      );
    }
  }

  private async validateSkillIds(input: CreateTaskInput): Promise<void> {
    const skillIds = collectSkillIds(input);

    if (skillIds.length === 0) {
      return;
    }

    const skills = await this.skills.findByIds(skillIds);
    const foundIds = new Set(skills.map((skill) => skill.id));
    const missingIds = skillIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new NotFoundError(`Skill not found: ${missingIds.join(", ")}`);
    }
  }

  private async ensureAllDescendantsDone(taskId: number): Promise<void> {
    const allTasks = await this.repository.findAllWithRelations();
    const descendants = findDescendants(taskId, allTasks);
    const incomplete = descendants.filter((descendant) => descendant.status !== "DONE");

    if (incomplete.length > 0) {
      const incompleteIds = incomplete.map((descendant) => descendant.id).join(", ");
      throw new ConflictError(
        `Cannot mark task as DONE until all subtasks are DONE. Incomplete subtask ids: ${incompleteIds}`,
      );
    }
  }

  private async validateAssignment(
    taskSkills: { skill: { id: number; name: string } }[],
    assignedDeveloperId: number | null,
  ): Promise<void> {
    if (assignedDeveloperId === null) {
      return;
    }

    const developer = await this.developers.findById(assignedDeveloperId);

    if (!developer) {
      throw new NotFoundError(`Developer with id ${assignedDeveloperId} not found`);
    }

    const requiredSkillIds = taskSkills.map((entry) => entry.skill.id);
    const developerSkillIds = developer.skills.map((skill) => skill.id);

    if (!developerHasRequiredSkills(requiredSkillIds, developerSkillIds)) {
      const missingSkillNames = taskSkills
        .filter((entry) => !developerSkillIds.includes(entry.skill.id))
        .map((entry) => entry.skill.name);

      throw new UnprocessableEntityError(
        `Developer "${developer.name}" lacks required skills: ${missingSkillNames.join(", ")}`,
      );
    }
  }
}

export const taskService = new TaskService();
