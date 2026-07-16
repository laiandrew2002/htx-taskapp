import { useQuery } from "@tanstack/react-query";
import { getSkills } from "@/services/skillApi";
import { queryKeys } from "@/utils/queryKeys";

export function useSkills() {
  return useQuery({
    queryKey: queryKeys.skills,
    queryFn: getSkills,
  });
}
