import type { SkillDTO } from "./skill.types";

export interface DeveloperDTO {
  id: number;
  name: string;
  skills: SkillDTO[];
}
