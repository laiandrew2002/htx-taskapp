import { useQuery } from "@tanstack/react-query";
import { getDevelopers } from "@/services/developerApi";
import { queryKeys } from "@/utils/queryKeys";

export function useDevelopers() {
  return useQuery({
    queryKey: queryKeys.developers,
    queryFn: getDevelopers,
  });
}
