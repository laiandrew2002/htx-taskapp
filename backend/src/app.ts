import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/notFound.middleware";
import apiRouter from "./routes";
import { sendSuccess } from "./utils/apiResponse";
import type { HealthResponse } from "./types/api.types";

function getCorsOrigins(): string | string[] {
  const origins = env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length === 1 ? origins[0] : origins;
}

export function createApp(): express.Application {
  const app = express();

  app.use(
    cors({
      origin: getCorsOrigins(),
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

  app.use("/api", apiRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
