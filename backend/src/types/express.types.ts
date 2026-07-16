import type { Request } from "express";

export interface ValidatedData {
  params?: unknown;
  query?: unknown;
  body?: unknown;
}

export type ValidatedRequest<
  TParams = Record<string, string>,
  TQuery = Record<string, unknown>,
  TBody = unknown,
> = Request & {
  validated: {
    params?: TParams;
    query?: TQuery;
    body?: TBody;
  };
};

declare module "express-serve-static-core" {
  interface Request {
    validated?: ValidatedData;
  }
}
