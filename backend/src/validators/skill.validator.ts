import { z } from "zod";
import { emptyQuerySchema } from "./common.validator";

export const listSkillsQuerySchema = emptyQuerySchema;

export type ListSkillsQuery = z.infer<typeof listSkillsQuerySchema>;
