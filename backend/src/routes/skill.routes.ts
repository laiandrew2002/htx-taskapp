import { Router } from "express";
import { listSkills } from "../controllers/skill.controller";
import { validate } from "../middleware/validate.middleware";
import { listSkillsQuerySchema } from "../validators/skill.validator";

const skillRouter = Router();

skillRouter.get("/", validate({ query: listSkillsQuerySchema }), listSkills);

export default skillRouter;
