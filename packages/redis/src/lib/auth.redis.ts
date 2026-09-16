import { redis } from "./redis.js";

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export const setCurrentRefreshToken = async (
  role: "user" | "seller" | "admin",
  accountId: string,
  token: string,
) => {
  const key = `refresh:${role}_${accountId}`;
  await redis.set(key, token, "EX", REFRESH_TOKEN_TTL_SECONDS);
};

export const getCurrentRefreshToken = async (
  role: "user" | "seller" | "admin",
  accountId: string,
): Promise<string | null> => {
  const key = `refresh:${role}_${accountId}`;
  return await redis.get(key);
};

export const clearCurrentRefreshToken = async (
  role: "user" | "seller" | "admin",
  accountId: string,
) => {
  const key = `refresh:${role}_${accountId}`;
  await redis.del(key);
};
