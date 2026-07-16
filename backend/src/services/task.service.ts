import { NotFoundError } from "../utils/errors";
import type { TaskDTO } from "../types/task.types";
import type { ListTasksQuery } from "../validators/task.validator";
import { taskRepository } from "../repositories/task.repository";

export class TaskService {
  constructor(private readonly repository = taskRepository) {}

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
}

export const taskService = new TaskService();
