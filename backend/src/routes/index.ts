import { Router } from "express";
import developerRouter from "./developer.routes";
import skillRouter from "./skill.routes";
import taskRouter from "./task.routes";

const apiRouter = Router();

apiRouter.use("/tasks", taskRouter);
apiRouter.use("/developers", developerRouter);
apiRouter.use("/skills", skillRouter);

export default apiRouter;