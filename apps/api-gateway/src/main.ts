import * as path from "node:path";
import express, { ErrorRequestHandler, RequestHandler } from "express";
import proxy, { ProxyOptions } from "express-http-proxy";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import httpProxy from "http-proxy";

import { initializeConfig } from "./libs/initializeSiteConfig";
import { corsMiddleware } from "./shared/middlewares/cors";
import {
  createRateLimiter,
  globalLimiter,
} from "@packages/middleware/rate-limit";
import { getGeo } from "./shared/geo";

const app = express();

const UPSTREAM_TIMEOUT_MS = 60_000;
const RETRY_AFTER_SECONDS = "5";

type ProxyError = Error & {
  code?: string;
  errors?: Array<{ code?: string }>;
};

const geoLimiter = createRateLimiter({
  prefix: "rl:geo:",
  limit: 60,
  windowMs: 60_000,
});

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
  limit: "100mb",
  proxyErrorHandler,
};
app.disable("x-powered-by");

app.use(corsMiddleware);

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cookieParser());
app.set("trust proxy", 1);

app.use(globalLimiter);

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

app.get("/api/geo", geoLimiter, getGeo);

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use(markProxyStart);

const orderWebhookProxy = proxy("http://localhost:6004", {
  ...withClientIp,
  proxyReqPathResolver: (req) => req.originalUrl,
});

app.use("/api/sellers", proxy("http://localhost:6007", withClientIp));
app.use("/api/chatting", proxy("http://localhost:6006", withClientIp));
app.use("/api/admin", proxy("http://localhost:6005", withClientIp));
app.use("/api/orders", proxy("http://localhost:6004", withClientIp));
app.use("/api/order", orderWebhookProxy);
app.use("/api/paystack-webhook", orderWebhookProxy);
app.use("/api/users", proxy("http://localhost:6003", withClientIp));
app.use("/api/products", proxy("http://localhost:6002", withClientIp));
app.use("/", proxy("http://localhost:6001", withClientIp));

app.use(gatewayErrorHandler);

const port = process.env.PORT || 8080;

const createWsProxy = (target: string) => {
  const wsProxy = httpProxy.createProxyServer({
    target,
    ws: true,
    xfwd: true,
  });

  wsProxy.on("error", (err, _req, socket) => {
    console.error(
      `[gateway] websocket upstream unavailable (${target}) (${
        (err as NodeJS.ErrnoException).code ?? err.message
      })`,
    );

    if (socket && "destroy" in socket) {
      socket.destroy();
    }
  });

  return wsProxy;
};

const chattingWsProxy = createWsProxy("http://localhost:6006");
const loggerWsProxy = createWsProxy("http://localhost:6008");

const server = app.listen(port, async () => {
  console.log(`Listening at http://localhost:${port}/api`);

  try {
    await initializeConfig();
  } catch (err) {
    console.log("Failed to inialize site config:", err);
  }
});

server.on("upgrade", (req, socket, head) => {
  let pathname = "/";

  try {
    pathname = new URL(req.url ?? "/", "http://localhost").pathname;
  } catch {
    pathname = "/";
  }

  if (pathname === "/logger") {
    loggerWsProxy.ws(req, socket, head);
    return;
  }

  chattingWsProxy.ws(req, socket, head);
});

server.on("error", console.error);
