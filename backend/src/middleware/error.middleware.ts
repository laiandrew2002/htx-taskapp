import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";
import type { ApiErrorResponse } from "../types/api.types";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    };
    res.status(400).json(body);
    return;
  }

  console.error("Unhandled error:", err);

  const body: ApiErrorResponse = {
    success: false,
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    },
  };
  res.status(500).json(body);
}
