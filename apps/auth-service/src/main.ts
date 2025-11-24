import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import { ErrorMiddleware } from "../../../packages/error-handler/error-middleware";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});

app.use(ErrorMiddleware);

const server = app.listen(port, host, () => {
  console.log(`Auth service is running at http://${host}:${port}`);
});

server.on("error", console.error);
