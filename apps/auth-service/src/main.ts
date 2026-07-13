import cors from "cors";
import express, { type Response } from "express";
import cookieParser from "cookie-parser";
import swaggerUI from "swagger-ui-express";

import authRoutes from "./routes/auth.route";
import { ErrorMiddleware } from "@packages/error-handler";

const swaggerDocument = require("./swagger-output.json");

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();
app.disable("x-powered-by");

app.use(
  cors({
    origin: "http://localhost:3000",
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.get("/docs-json", (req, res: Response) => {
  res.json(swaggerDocument);
});

app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});

app.use("/api", authRoutes);

app.use(ErrorMiddleware);

const server = app.listen(port, host, () => {
  console.log(`Auth service is running at http://${host}:${port}/api`);
  console.log(`Swagger docs available at http://${host}:${port}/api-docs`);
  
  
});

server.on("error", console.error);
