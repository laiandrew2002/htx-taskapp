import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@/services/taskApi";
import { queryKeys } from "@/utils/queryKeys";

export function useTasks() {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: getTasks,
  });
}
