import * as path from "node:path";
import express, { ErrorRequestHandler, RequestHandler } from "express";
import proxy, { ProxyOptions } from "express-http-proxy";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { initializeConfig } from "./libs/initializeSiteConfig";
import { corsMiddleware } from "./shared/middlewares/cors";
import { globalLimiter } from "@packages/middleware/rate-limit";

const app = express();

const UPSTREAM_TIMEOUT_MS = 60_000;
const RETRY_AFTER_SECONDS = "5";

type ProxyError = Error & {
  code?: string;
  errors?: Array<{ code?: string }>;
};

const markProxyStart: RequestHandler = (req, res, next) => {
  res.locals.proxyStartedAt = Date.now();
  next();
};

const proxyErrorHandler: NonNullable<ProxyOptions["proxyErrorHandler"]> = (
  err: ProxyError,
  res,
  next,
) => {
  if (res.headersSent) {
    return next(err);
  }

  const elapsed = Date.now() - (res.locals.proxyStartedAt ?? Date.now());
  const code = err.code ?? err.errors?.find((e) => e.code)?.code ?? "";
  const timedOut =
    code === "ETIMEDOUT" ||
    code === "ESOCKETTIMEDOUT" ||
    (code === "ECONNRESET" && elapsed >= UPSTREAM_TIMEOUT_MS);

  console.error(
    `[gateway] upstream ${timedOut ? "timeout" : "unavailable"} (${code || err.name})`,
  );

  res.setHeader("Retry-After", RETRY_AFTER_SECONDS);

  return res.status(timedOut ? 504 : 502).json({
    status: "error",
    code: timedOut ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE",
    message: timedOut
      ? "The requested service took too long to respond. Please try again."
      : "The requested service is temporarily unavailable. Please try again shortly.",
  });
};

const gatewayErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(`[gateway] ${req.method} ${req.originalUrl} - ${err.message}`);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    status: "error",
    message: "Something went wrong, please try again later",
  });
};

const withClientIp: ProxyOptions = {
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    const prior = srcReq.headers["x-forwarded-for"];
    proxyReqOpts.headers["x-forwarded-for"] = prior
      ? `${prior}, ${srcReq.ip}`
      : srcReq.ip;
    return proxyReqOpts;
  },
  timeout: UPSTREAM_TIMEOUT_MS,
  proxyErrorHandler,
};
app.disable("x-powered-by");

app.use(corsMiddleware);

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);

app.use(globalLimiter);

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use(markProxyStart);

app.use("/api/sellers", proxy("http://localhost:6007", withClientIp));
app.use("/api/chatting", proxy("http://localhost:6006", withClientIp));
app.use("/api/admin", proxy("http://localhost:6005", withClientIp));
app.use("/api/orders", proxy("http://localhost:6004", withClientIp));
app.use("/api/users", proxy("http://localhost:6003", withClientIp));
app.use("/api/products", proxy("http://localhost:6002", withClientIp));
app.use("/", proxy("http://localhost:6001", withClientIp));

app.use(gatewayErrorHandler);

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
