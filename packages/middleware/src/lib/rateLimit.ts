import { rateLimit } from "express-rate-limit";
import { RedisReply, RedisStore } from "rate-limit-redis";

import { redis } from "@packages/redis";

type Opts = {
  prefix: string;
  limit: number;
  windowMs?: number;
  passOnStoreError?: boolean;
};

export const createRateLimiter = ({
  prefix,
  limit,
  windowMs = 15 * 60 * 1000,
  passOnStoreError = true,
}: Opts) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ipv6Subnet: 56,
    passOnStoreError,
    store: new RedisStore({
      prefix,
      sendCommand: (command: string, ...args: string[]) =>
        redis.call(command, ...args) as Promise<RedisReply>,
    }),
    handler: (_req, res) =>
      res.status(429).json({
        success: false,
        message: "Too many requests, please try again later!",
      }),
  });

export const globalLimiter = createRateLimiter({
  prefix: "rl:global:",
  limit: 1000,
});
export const authLimiter = createRateLimiter({ prefix: "rl:auth:", limit: 20 });
export const refreshLimiter = createRateLimiter({
  prefix: "rl:refresh:",
  limit: 60,
});
