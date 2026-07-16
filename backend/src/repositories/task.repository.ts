import type { Prisma, TaskStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { CreateTaskInput, TaskDTO } from "../types/task.types";
import {
  buildTaskSubtree,
  buildTaskTree,
  taskInclude,
  type TaskWithRelations,
} from "../utils/taskMapper";
import { normalizeCreateTaskInput } from "../utils/taskTree";

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

  async createTaskTree(input: CreateTaskInput): Promise<TaskDTO> {
    const normalizedInput = normalizeCreateTaskInput(input);

    const rootId = await prisma.$transaction(async (tx) => {
      return this.createTaskNode(tx, normalizedInput, null);
    });

    const task = await this.findTaskTreeById(rootId);

    if (!task) {
      throw new Error(`Failed to load created task with id ${rootId}`);
    }

    return task;
  }

  private async createTaskNode(
    tx: Prisma.TransactionClient,
    input: CreateTaskInput,
    parentTaskId: number | null,
  ): Promise<number> {
    const task = await tx.task.create({
      data: {
        title: input.title,
        parentTaskId,
        skills: input.skillIds?.length
          ? {
              create: input.skillIds.map((skillId) => ({ skillId })),
            }
          : undefined,
      },
    });

    for (const subtask of input.subtasks ?? []) {
      await this.createTaskNode(tx, subtask, task.id);
    }

    return task.id;
  }

  async update(
    id: number,
    data: { status?: TaskStatus; assignedDeveloperId?: number | null },
  ): Promise<void> {
    await prisma.task.update({
      where: { id },
      data: {
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.assignedDeveloperId !== undefined
          ? { assignedDeveloperId: data.assignedDeveloperId }
          : {}),
      },
    });
  }
}

export const taskRepository = new TaskRepository();
