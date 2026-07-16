import { NotFoundError } from "../utils/errors";
import type { CreateTaskInput, TaskDTO } from "../types/task.types";
import type { ListTasksQuery } from "../validators/task.validator";
import { taskRepository } from "../repositories/task.repository";
import { skillRepository } from "../repositories/skill.repository";
import { collectSkillIds } from "../utils/taskTree";

export class TaskService {
  constructor(
    private readonly repository = taskRepository,
    private readonly skills = skillRepository,
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

  async createTask(input: CreateTaskInput): Promise<TaskDTO> {
    await this.validateSkillIds(input);
    return this.repository.createTaskTree(input);
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
}

export const taskService = new TaskService();
