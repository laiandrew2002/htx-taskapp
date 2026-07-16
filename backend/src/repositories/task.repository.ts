import type { TaskStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { TaskDTO } from "../types/task.types";
import {
  buildTaskSubtree,
  buildTaskTree,
  taskInclude,
  type TaskWithRelations,
} from "../utils/taskMapper";

export class TaskRepository {
  async findAllWithRelations(status?: TaskStatus): Promise<TaskWithRelations[]> {
    return prisma.task.findMany({
      where: status ? { status } : undefined,
      include: taskInclude,
      orderBy: { id: "asc" },
    });
  }

  async findByIdWithRelations(id: number): Promise<TaskWithRelations | null> {
    return prisma.task.findUnique({
      where: { id },
      include: taskInclude,
    });
  }

  async findRootTasks(status?: TaskStatus): Promise<TaskDTO[]> {
    const tasks = await this.findAllWithRelations(status);
    return buildTaskTree(tasks, null);
  }

  async findTaskTreeById(id: number): Promise<TaskDTO | null> {
    const tasks = await this.findAllWithRelations();
    return buildTaskSubtree(tasks, id);
  }
}

export const taskRepository = new TaskRepository();
