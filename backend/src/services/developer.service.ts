import { NotFoundError } from "../utils/errors";
import type { DeveloperDTO } from "../types/developer.types";
import { developerRepository } from "../repositories/developer.repository";

export class DeveloperService {
  constructor(private readonly repository = developerRepository) {}

  async listDevelopers(): Promise<DeveloperDTO[]> {
    return this.repository.findAll();
  }

  async getDeveloperById(id: number): Promise<DeveloperDTO> {
    const developer = await this.repository.findById(id);

    if (!developer) {
      throw new NotFoundError(`Developer with id ${id} not found`);
    }

    return developer;
  }
}

export const developerService = new DeveloperService();
