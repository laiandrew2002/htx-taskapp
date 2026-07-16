import type { Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import type { ValidatedRequest } from "../types/express.types";
import { taskService } from "../services/task.service";
import type { IdParam } from "../validators/common.validator";
import type { ListTasksQuery } from "../validators/task.validator";

export const listTasks = asyncHandler(
  async (req: ValidatedRequest<unknown, ListTasksQuery>, res: Response) => {
    const tasks = await taskService.listTasks(req.validated.query ?? {});
    sendSuccess(res, tasks);
  },
);

export const getTaskById = asyncHandler(
  async (req: ValidatedRequest<IdParam>, res: Response) => {
    const { id } = req.validated.params as IdParam;
    const task = await taskService.getTaskById(id);
    sendSuccess(res, task);
  },
);
