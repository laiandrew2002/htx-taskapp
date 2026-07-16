export const queryKeys = {
  tasks: ["tasks"] as const,
  task: (id: number) => ["tasks", id] as const,
  developers: ["developers"] as const,
  skills: ["skills"] as const,
};
