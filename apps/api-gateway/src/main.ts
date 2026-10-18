import * as path from "node:path";
import express from "express";
import proxy, { ProxyOptions } from "express-http-proxy";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { initializeConfig } from "./libs/initializeSiteConfig";
import { corsMiddleware } from "./shared/middlewares/cors";
import { globalLimiter } from "@packages/middleware/rate-limit";

const app = express();
const withClientIp: ProxyOptions = {
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    const prior = srcReq.headers["x-forwarded-for"];
    proxyReqOpts.headers["x-forwarded-for"] = prior
      ? `${prior}, ${srcReq.ip}`
      : srcReq.ip;
    return proxyReqOpts;
  },
};
app.disable("x-powered-by");

app.use(corsMiddleware);

app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);

app.use(globalLimiter);

app.use("/api/sellers", proxy("http://localhost:6007", withClientIp));
app.use("/api/chatting", proxy("http://localhost:6006", withClientIp));
app.use("/api/admin", proxy("http://localhost:6005", withClientIp));
app.use("/api/orders", proxy("http://localhost:6004", withClientIp));
app.use("/api/users", proxy("http://localhost:6003", withClientIp));
app.use("/api/products", proxy("http://localhost:6002", withClientIp));
app.use("/", proxy("http://localhost:6001", withClientIp));

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

const port = process.env.PORT || 8080;
const server = app.listen(port, async () => {
  console.log(`Listening at http://localhost:${port}/api`);

  try {
    await initializeConfig();
  } catch (err) {
    console.log("Failed to inialize site config:", err);
  }
});
server.on("error", console.error);
