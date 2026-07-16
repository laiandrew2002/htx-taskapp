import { Router } from "express";
import { createTask, getTaskById, listTasks } from "../controllers/task.controller";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import { createTaskBodySchema, listTasksQuerySchema } from "../validators/task.validator";

const taskRouter = Router();

taskRouter.get("/", validate({ query: listTasksQuerySchema }), listTasks);

taskRouter.post("/", validate({ body: createTaskBodySchema }), createTask);

taskRouter.get(
  "/:id",
  validate({ params: idParamSchema, query: listTasksQuerySchema }),
  getTaskById,
);

export default taskRouter;
