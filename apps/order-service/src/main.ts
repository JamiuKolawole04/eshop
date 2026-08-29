import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import { ErrorMiddleware } from "@packages/error-handler";
import orderRoutes from "./routes/order.route";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6004;

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
app.use(bodyParser());

app.get("/health", (req, res) => {
  res.send({ message: "Hello Order API" });
});

app.use("/", orderRoutes);

app.use(ErrorMiddleware);

const server = app.listen(port, host, () => {
  console.log(`Order service is running at http://${host}:${port}`);
});

server.on("error", console.error);
