import express from "express";
import cookieParser from "cookie-parser";

import { ErrorMiddleware } from "@packages/error-handler";
import adminRoutes from "./routes/admin.route";

const app = express();

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6005;

app.disable("x-powered-by");

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.send({ message: "Welcome to admin API!" });
});

app.use("/", adminRoutes);

app.use(ErrorMiddleware);

const server = app.listen(port, () => {
  console.log(`Admin service is running at http://${host}:${port}`);
});
server.on("error", console.error);
