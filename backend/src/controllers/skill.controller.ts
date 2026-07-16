import type { Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import type { ValidatedRequest } from "../types/express.types";
import { skillService } from "../services/skill.service";
import type { ListSkillsQuery } from "../validators/skill.validator";

export const listSkills = asyncHandler(
  async (_req: ValidatedRequest<unknown, ListSkillsQuery>, res: Response) => {
    const skills = await skillService.listSkills();
    sendSuccess(res, skills);
  },
);
