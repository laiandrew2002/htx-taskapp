import type { SkillDTO } from "../types/skill.types";
import { skillRepository } from "../repositories/skill.repository";

export class SkillService {
  constructor(private readonly repository = skillRepository) {}

  async listSkills(): Promise<SkillDTO[]> {
    return this.repository.findAll();
  }
}

export const skillService = new SkillService();
