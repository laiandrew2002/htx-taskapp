import { z } from "zod";
import type { CreateTaskInput } from "../types/task.types";

export const listTasksQuerySchema = z
  .object({
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  })
  .strict();

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export const createTaskBodySchema: z.ZodType<CreateTaskInput> = z.lazy(() =>
  z.object({
    title: z.string().trim().min(1, "Title is required"),
    skillIds: z.array(z.coerce.number().int().positive()).optional(),
    subtasks: z.array(createTaskBodySchema).optional(),
  }),
);

export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;

export const updateTaskBodySchema = z
  .object({
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    assignedDeveloperId: z.union([z.coerce.number().int().positive(), z.null()]).optional(),
  })
  .refine(
    (data) => data.status !== undefined || data.assignedDeveloperId !== undefined,
    {
      message: "At least one field must be provided",
    },
  );

export type UpdateTaskBody = z.infer<typeof updateTaskBodySchema>;
