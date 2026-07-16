import { prisma } from "../config/prisma";
import type { DeveloperDTO } from "../types/developer.types";
import { mapSkill } from "../utils/taskMapper";

const developerInclude = {
  skills: {
    include: {
      skill: true,
    },
  },
} as const;

function mapDeveloperRecord(
  developer: {
    id: number;
    name: string;
    skills: { skill: { id: number; name: string } }[];
  },
): DeveloperDTO {
  return {
    id: developer.id,
    name: developer.name,
    skills: developer.skills.map((entry) => mapSkill(entry.skill)),
  };
}

export class DeveloperRepository {
  async findAll(): Promise<DeveloperDTO[]> {
    const developers = await prisma.developer.findMany({
      include: developerInclude,
      orderBy: { name: "asc" },
    });

    return developers.map(mapDeveloperRecord);
  }

  async findById(id: number): Promise<DeveloperDTO | null> {
    const developer = await prisma.developer.findUnique({
      where: { id },
      include: developerInclude,
    });

    if (!developer) {
      return null;
    }

    return mapDeveloperRecord(developer);
  }
}

export const developerRepository = new DeveloperRepository();
