import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "@/services/taskApi";
import type { UpdateTaskInput } from "@/types/task.types";
import { queryKeys } from "@/utils/queryKeys";

interface UpdateTaskVariables {
  id: number;
  input: UpdateTaskInput;
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateTaskVariables) => updateTask(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}
