import type { TaskStatus } from "@/types/task.types";

export const queryKeys = {
  tasks: (status?: TaskStatus) =>
    status ? (["tasks", { status }] as const) : (["tasks"] as const),
  task: (id: number) => ["tasks", id] as const,
  developers: ["developers"] as const,
  skills: ["skills"] as const,
};
