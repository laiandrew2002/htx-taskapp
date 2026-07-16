import { Router } from "express";
import { createTask, getTaskById, listTasks, updateTask } from "../controllers/task.controller";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import {
  createTaskBodySchema,
  listTasksQuerySchema,
  updateTaskBodySchema,
} from "../validators/task.validator";

const taskRouter = Router();

taskRouter.get("/", validate({ query: listTasksQuerySchema }), listTasks);

taskRouter.post("/", validate({ body: createTaskBodySchema }), createTask);

taskRouter.patch(
  "/:id",
  validate({ params: idParamSchema, body: updateTaskBodySchema }),
  updateTask,
);

taskRouter.get(
  "/:id",
  validate({ params: idParamSchema, query: listTasksQuerySchema }),
  getTaskById,
);

export default taskRouter;