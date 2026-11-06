#!/usr/bin/env node
/**
 * Runs the whole backend in one container (Render free tier exposes a single
 * port and bills per service, so eight services are not an option).
 *
 * - every HTTP service gets its own PORT on 127.0.0.1
 * - the gateway is started last and inherits the platform's $PORT
 * - each child gets a log prefix so Render's log stream stays readable
 * - if a critical child dies the container exits, letting Render restart it
 *
 * Run `npx nx run-many -t build -p <services>` and `npx prisma generate`
 * before this script; it only runs the compiled `apps/<name>/dist/main.js`.
 */
import "dotenv/config";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const HTTP_SERVICES = [
  { name: "auth-service", port: 6001, health: "/" },
  { name: "product-service", port: 6002, health: "/health" },
  { name: "user-service", port: 6003, health: "/health" },
  { name: "order-service", port: 6004, health: "/health" },
  { name: "admin-service", port: 6005, health: "/health" },
  { name: "chatting-service", port: 6006, health: "/health" },
  { name: "seller-service", port: 6007, health: "/health" },
];

const WORKERS = [
  // Analytics only: a Kafka outage must not take the storefront down.
  { name: "kafka-service", optional: true },
];

const GATEWAY = {
  name: "api-gateway",
  port: Number(process.env.PORT) || 8080,
  health: "/gateway-health",
};

const children = new Map();
let shuttingDown = false;
let exitCode = 0;

const prefixStream = (name, stream, target) => {
  let buffer = "";
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      target.write(`[${name}] ${line}\n`);
    }
  });
  stream.on("end", () => {
    if (buffer) {
      target.write(`[${name}] ${buffer}\n`);
    }
  });
};

const shutdown = (code = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  exitCode = code;

  if (children.size === 0) {
    process.exit(code);
  }

  for (const [name, child] of children) {
    console.log(`[bootstrap] stopping ${name}`);
    child.kill("SIGTERM");
  }

  // Render gives a short grace period; don't wait forever on a stuck child.
  const timer = setTimeout(() => {
    for (const child of children.values()) {
      child.kill("SIGKILL");
    }
    process.exit(code);
  }, 10_000);
  timer.unref();
};

const start = (service, env = {}) => {
  const entry = path.join(root, "apps", service.name, "dist", "main.js");

  if (!existsSync(entry)) {
    console.error(
      `[bootstrap] missing build output for ${service.name}: ${path.relative(root, entry)}`,
    );
    shutdown(1);
    return null;
  }

  const child = spawn(process.execPath, [entry], {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });

  children.set(service.name, child);
  prefixStream(service.name, child.stdout, process.stdout);
  prefixStream(service.name, child.stderr, process.stderr);

  child.on("exit", (code, signal) => {
    children.delete(service.name);

    if (shuttingDown) {
      if (children.size === 0) {
        process.exit(exitCode);
      }
      return;
    }

    console.error(
      `[bootstrap] ${service.name} exited (code=${code ?? "null"}, signal=${signal ?? "none"})`,
    );

    if (service.optional) {
      console.error(
        `[bootstrap] ${service.name} is optional, continuing without it`,
      );
      return;
    }

    shutdown(1);
  });

  console.log(
    `[bootstrap] started ${service.name}${
      service.port ? ` on :${service.port}` : " (worker)"
    }`,
  );

  return child;
};

const waitForHealth = async (service, timeoutMs = 120_000) => {
  const deadline = Date.now() + timeoutMs;
  const url = `http://localhost:${service.port}${service.health}`;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(3_000),
      });

      if (response.ok) {
        console.log(`[bootstrap] ${service.name} healthy`);
        return true;
      }
    } catch {
      // Not up yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }

  console.error(`[bootstrap] ${service.name} did not become healthy at ${url}`);
  return false;
};

process.on("SIGTERM", () => shutdown(0));
process.on("SIGINT", () => shutdown(0));

console.log("[bootstrap] starting backend services");

for (const service of HTTP_SERVICES) {
  start(service, { PORT: String(service.port) });
}

for (const worker of WORKERS) {
  start(worker);
}

const healthChecks = await Promise.all(
  HTTP_SERVICES.map((service) => waitForHealth(service)),
);

if (healthChecks.some((healthy) => !healthy)) {
  shutdown(1);
} else {
  // The gateway is the only public port; start it once every upstream is up.
  start(GATEWAY);

  if (!(await waitForHealth(GATEWAY, 60_000))) {
    shutdown(1);
  }
}
