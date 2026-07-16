import { Router } from "express";
import { getTaskById, listTasks } from "../controllers/task.controller";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import { listTasksQuerySchema } from "../validators/task.validator";

const taskRouter = Router();

taskRouter.get("/", validate({ query: listTasksQuerySchema }), listTasks);

taskRouter.get(
  "/:id",
  validate({ params: idParamSchema, query: listTasksQuerySchema }),
  getTaskById,
);

export default taskRouter;
