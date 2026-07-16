import type { Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import type { ValidatedRequest } from "../types/express.types";
import { developerService } from "../services/developer.service";
import type { IdParam } from "../validators/common.validator";
import type { ListDevelopersQuery } from "../validators/developer.validator";

export const listDevelopers = asyncHandler(
  async (_req: ValidatedRequest<unknown, ListDevelopersQuery>, res: Response) => {
    const developers = await developerService.listDevelopers();
    sendSuccess(res, developers);
  },
);

export const getDeveloperById = asyncHandler(
  async (req: ValidatedRequest<IdParam>, res: Response) => {
    const { id } = req.validated.params as IdParam;
    const developer = await developerService.getDeveloperById(id);
    sendSuccess(res, developer);
  },
);
