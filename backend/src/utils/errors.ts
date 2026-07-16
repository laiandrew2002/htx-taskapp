import type { ApiErrorCode } from "../types/api.types";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly details?: { path: string; message: string }[];

  constructor(
    message: string,
    statusCode: number,
    code: ApiErrorCode,
    details?: { path: string; message: string }[],
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: { path: string; message: string }[]) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string) {
    super(message, 422, "UNPROCESSABLE_ENTITY");
  }
}
