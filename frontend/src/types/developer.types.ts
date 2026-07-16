import type { Skill } from "./skill.types";

export interface Developer {
  id: number;
  name: string;
  skills: Skill[];
}
