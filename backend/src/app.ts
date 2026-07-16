import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";
import { sendSuccess } from "./utils/apiResponse";
import type { HealthResponse } from "./types/api.types";

export function createApp(): express.Application {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    const data: HealthResponse = {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
    return sendSuccess(res, data);
  });

  app.use(errorMiddleware);

  return app;
}
