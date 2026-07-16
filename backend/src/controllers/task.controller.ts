import type { Response } from "express";
import { sendCreated, sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import type { ValidatedRequest } from "../types/express.types";
import { taskService } from "../services/task.service";
import type { IdParam } from "../validators/common.validator";
import type { CreateTaskBody, ListTasksQuery, UpdateTaskBody } from "../validators/task.validator";

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

export const createTask = asyncHandler(
  async (req: ValidatedRequest<unknown, unknown, CreateTaskBody>, res: Response) => {
    const body = req.validated.body as CreateTaskBody;
    const result = await taskService.createTask(body);
    sendCreated(res, result);
  },
);

export const updateTask = asyncHandler(
  async (req: ValidatedRequest<IdParam, unknown, UpdateTaskBody>, res: Response) => {
    const { id } = req.validated.params as IdParam;
    const body = req.validated.body as UpdateTaskBody;
    const task = await taskService.updateTask(id, body);
    sendSuccess(res, task);
  },
);
