import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@/services/taskApi";

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
