import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL environment variable is required");
}

export const redis = new Redis(redisUrl);
export const bullmqRedis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

const attachIndicators = (client: Redis, label: string) => {
  client.on("connect", () => {
    console.log(`[redis:${label}] connected`);

    client
      .ping()
      .then((result) => {
        console.log(`[redis:${label}] PING ${result}`);
      })
      .catch((err: unknown) => {
        console.error(
          `[redis:${label}] PING failed:`,
          err instanceof Error ? err.message : err,
        );
      });
  });

  client.on("ready", () => {
    console.log(`[redis:${label}] ready`);
  });

  client.on("reconnecting", (delay: number) => {
    console.warn(`[redis:${label}] reconnecting in ${delay}ms`);
  });

  client.on("error", (err: unknown) => {
    console.error(
      `[redis:${label}] error:`,
      err instanceof Error ? err.message : err,
    );
  });

  client.on("end", () => {
    console.warn(`[redis:${label}] closed`);
  });
};

attachIndicators(redis, "main");
attachIndicators(bullmqRedis, "bullmq");
