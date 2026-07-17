import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTasks } from "@/services/taskApi";
import type { TaskStatus } from "@/types/task.types";
import { queryKeys } from "@/utils/queryKeys";

export function useTasks(status?: TaskStatus) {
  return useQuery({
    queryKey: queryKeys.tasks(status),
    queryFn: () => getTasks(status),
    placeholderData: keepPreviousData,
  });
}
