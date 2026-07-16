import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("ID must be a positive integer"),
});

export type IdParam = z.infer<typeof idParamSchema>;

export const emptyQuerySchema = z.object({}).strict();
