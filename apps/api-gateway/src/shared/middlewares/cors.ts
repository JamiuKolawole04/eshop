import cors from "cors";

const localOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

const configuredOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  origin: configuredOrigins.length > 0 ? configuredOrigins : localOrigins,
  allowedHeaders: ["Authorization", "Content-Type", "x-client-role"],
  credentials: true,
});
