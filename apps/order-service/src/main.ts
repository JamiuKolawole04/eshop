/* eslint-disable @typescript-eslint/no-explicit-any */

import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import { ErrorMiddleware } from "@packages/error-handler";
import orderRoutes from "./routes/order.route";
import { createOrder } from "./controllers/order.controller";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6004;

const app = express();
app.disable("x-powered-by");

app.post(
  "/api/order",
  bodyParser.raw({ type: "application/json" }),
  (req, res, next) => {
    (req as any).rawBody = req.body;
    next();
  },

  createOrder,
);

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.send({ message: "Hello Order API" });
});

app.use("/", orderRoutes);

app.use(ErrorMiddleware);

const server = app.listen(port, host, () => {
  console.log(`Order service is running at http://${host}:${port}`);
});

server.on("error", console.error);
