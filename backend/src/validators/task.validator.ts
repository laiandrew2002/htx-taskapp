import { z } from "zod";

export const listTasksQuerySchema = z
  .object({
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  })
  .strict();

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
