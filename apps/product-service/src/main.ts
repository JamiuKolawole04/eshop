import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import { ErrorMiddleware } from "@packages/error-handler";
import productRoutes from "./routes/product.route";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6002;

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

app.get("/", (req, res) => {
  res.send({ message: "Hello Product API" });
});

app.use("/", productRoutes);

app.use(ErrorMiddleware);

const server = app.listen(port, host, () => {
  console.log(`Product service is running at http://${host}:${port}`);
});

server.on("error", console.error);
