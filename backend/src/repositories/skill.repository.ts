import { prisma } from "../config/prisma";
import type { SkillDTO } from "../types/skill.types";

export class SkillRepository {
  async findAll(): Promise<SkillDTO[]> {
    const skills = await prisma.skill.findMany({
      orderBy: { name: "asc" },
    });

    return skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
    }));
  }

  async findByIds(ids: number[]): Promise<SkillDTO[]> {
    if (ids.length === 0) {
      return [];
    }

    const skills = await prisma.skill.findMany({
      where: { id: { in: ids } },
      orderBy: { id: "asc" },
    });

    return skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
    }));
  }

  async findByNames(names: string[]): Promise<SkillDTO[]> {
    if (names.length === 0) {
      return [];
    }

    const skills = await prisma.skill.findMany({
      where: { name: { in: names } },
      orderBy: { name: "asc" },
    });

    return skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
    }));
  }
}

export const skillRepository = new SkillRepository();
