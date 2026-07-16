import { Router } from "express";
import {
  getDeveloperById,
  listDevelopers,
} from "../controllers/developer.controller";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import {
  getDeveloperQuerySchema,
  listDevelopersQuerySchema,
} from "../validators/developer.validator";

const developerRouter = Router();

developerRouter.get(
  "/",
  validate({ query: listDevelopersQuerySchema }),
  listDevelopers,
);

developerRouter.get(
  "/:id",
  validate({ params: idParamSchema, query: getDeveloperQuerySchema }),
  getDeveloperById,
);

export default developerRouter;
