import type { NextFunction, Request, RequestHandler, Response } from "express";

// Express parses route params as strings, while our Zod-validated handlers
// expect coerced types (e.g. `id: number`). We therefore keep the handler's
// own request type and cast only at the Express boundary.
type AsyncHandler = <H extends (...args: never[]) => Promise<unknown>>(
  handler: H,
) => RequestHandler;

export const asyncHandler: AsyncHandler = (handler) => {
  const typedHandler = handler as unknown as (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;

  return (req, res, next) => {
    void typedHandler(req, res, next).catch(next);
  };
};
