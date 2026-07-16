import { createApp } from "./app";
import { env } from "./config/env";
import { disconnectPrisma } from "./config/prisma";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}, shutting down gracefully...`);

  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
