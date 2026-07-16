import type { Request, Response } from "express";
import { NotFoundError } from "../utils/errors";

export function notFoundMiddleware(_req: Request, _res: Response): never {
  throw new NotFoundError("Route not found");
}
