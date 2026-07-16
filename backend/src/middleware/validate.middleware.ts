import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

interface ValidationSchemas {
  params?: ZodType;
  query?: ZodType;
  body?: ZodType;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.validated = req.validated ?? {};

    if (schemas.params) {
      req.validated.params = schemas.params.parse(req.params);
    }

    if (schemas.query) {
      req.validated.query = schemas.query.parse(req.query);
    }

    if (schemas.body) {
      req.validated.body = schemas.body.parse(req.body);
    }

    next();
  };
}
