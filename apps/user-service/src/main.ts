import express from "express";
import cookieParser from "cookie-parser";

import { ErrorMiddleware } from "@packages/error-handler";
import userRoutes from "./routes/user.route";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6003;

const app = express();
app.disable("x-powered-by");

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.send({ message: "User API On!" });
});

app.use("/", userRoutes);

app.use(ErrorMiddleware);

const server = app.listen(port, host, () => {
  console.log(`User service is running at http://${host}:${port}`);
});

server.on("error", console.error);
