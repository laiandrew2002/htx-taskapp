import { z } from "zod";
import { emptyQuerySchema } from "./common.validator";

export const listDevelopersQuerySchema = emptyQuerySchema;
export const getDeveloperQuerySchema = emptyQuerySchema;

export type ListDevelopersQuery = z.infer<typeof listDevelopersQuerySchema>;
export type GetDeveloperQuery = z.infer<typeof getDeveloperQuerySchema>;
