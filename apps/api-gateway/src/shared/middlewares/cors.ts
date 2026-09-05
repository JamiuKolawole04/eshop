import cors from "cors";

export const corsMiddleware = cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
  ],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true,
});
