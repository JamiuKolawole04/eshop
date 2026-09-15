import express from "express";
import cookieParser from "cookie-parser";

import { ErrorMiddleware } from "@packages/error-handler";
import sellerRoutes from "./routes/seller.route";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6007;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.send({ message: "Hello seller service!" });
});

app.use("/", sellerRoutes);

app.use(ErrorMiddleware);

const server = app.listen(port, () => {
  console.log(`Seller service is running at http://${host}:${port}`);
});
server.on("error", console.error);
