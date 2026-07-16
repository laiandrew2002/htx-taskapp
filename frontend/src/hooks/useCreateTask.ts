import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@/services/taskApi";
import { queryKeys } from "@/utils/queryKeys";

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}
