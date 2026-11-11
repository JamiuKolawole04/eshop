import { isIP } from "node:net";
import { Request, RequestHandler } from "express";

import { redis } from "@packages/redis";

export type Geo = { country: string; city: string; region: string };

const BOT_UA =
  /bot|crawler|crawl|spider|slurp|bingpreview|facebookexternalhit|linkedinbot|twitterbot|telegrambot|headless|lighthouse|pagespeed|python-requests|curl|wget|go-http-client|node-fetch/i;

const IPDATA_BASE_URL = "https://api.ipdata.co";
const CACHE_PREFIX = "geo:v1:ip:";
const CACHE_TTL_SECONDS = 86_400;
const LOOKUP_TIMEOUT_MS = 1_000;
const CIRCUIT_OPEN_AUTH_STATUS_MS = 10 * 60 * 1_000;
const CIRCUIT_OPEN_OTHER_MS = 60 * 1_000;

type IpdataPayload = {
  country_name?: unknown;
  city?: unknown;
  region?: unknown;
};

type ClientIp = { ip: string; overrideUsed: boolean };

const inFlight = new Map<string, Promise<Geo | null>>();

let openUntil = 0;
let missingKeyLogged = false;

const stripMappedIpv4 = (ip: string): string => {
  const lower = ip.toLowerCase();
  return lower.startsWith("::ffff:") ? lower.slice("::ffff:".length) : lower;
};

export const isPrivateIp = (ip: string): boolean => {
  const version = isIP(ip);

  if (version === 4) {
    const [a, b] = ip.split(".").map(Number);

    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;

    return false;
  }

  if (version === 6) {
    const lower = ip.toLowerCase();

    if (lower === "::1") return true;
    if (lower.startsWith("::ffff:")) return isPrivateIp(stripMappedIpv4(lower));

    const firstHextet = Number.parseInt(lower.split(":")[0], 16);

    if (firstHextet >= 0xfc00 && firstHextet <= 0xfdff) return true;
    if (firstHextet >= 0xfe80 && firstHextet <= 0xfebf) return true;
    if (firstHextet === 0) return true;

    return false;
  }

  return true;
};

const getClientIp = (req: Request): ClientIp => {
  const override = req.query.ip;

  if (
    process.env.NODE_ENV !== "production" &&
    typeof override === "string" &&
    isIP(override) !== 0
  ) {
    return { ip: stripMappedIpv4(override), overrideUsed: true };
  }

  return {
    ip: stripMappedIpv4(req.ip ?? req.socket.remoteAddress ?? ""),
    overrideUsed: false,
  };
};

const openCircuit = (durationMs: number, reason: string): void => {
  const now = Date.now();
  const wasOpen = now < openUntil;

  openUntil = Math.max(openUntil, now + durationMs);

  if (!wasOpen) {
    console.error(
      `[geo] ipdata circuit opened for ${Math.round(durationMs / 1_000)}s (${reason})`,
    );
  }
};

const toGeo = (data: IpdataPayload): Geo | null => {
  const country =
    typeof data.country_name === "string" ? data.country_name.trim() : "";

  if (!country) return null;

  const region =
    typeof data.region === "string" && data.region.trim()
      ? data.region.trim()
      : "Unknown";

  const city =
    [data.city, data.region]
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .find((value) => value.length > 0) ?? "Unknown";

  return { country, city, region };
};

const lookupIpdata = async (ip: string): Promise<Geo | null> => {
  const apiKey = process.env.IPDATA_API_KEY;

  if (!apiKey) {
    if (!missingKeyLogged) {
      missingKeyLogged = true;
      console.error("[geo] IPDATA_API_KEY is not set; geo lookups are disabled");
    }

    return null;
  }

  try {
    const response = await fetch(
      `${IPDATA_BASE_URL}/${encodeURIComponent(ip)}?api-key=${encodeURIComponent(apiKey)}`,
      {
        signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
        headers: { Accept: "application/json" },
      },
    );

    if (!response.ok) {
      const authLike =
        response.status === 401 ||
        response.status === 403 ||
        response.status === 429;

      openCircuit(
        authLike ? CIRCUIT_OPEN_AUTH_STATUS_MS : CIRCUIT_OPEN_OTHER_MS,
        `HTTP ${response.status}`,
      );

      return null;
    }

    const data = (await response.json()) as IpdataPayload;

    return toGeo(data);
  } catch {
    openCircuit(CIRCUIT_OPEN_OTHER_MS, "request failed");

    return null;
  }
};

const resolveGeo = async (ip: string): Promise<Geo | null> => {
  const cacheKey = `${CACHE_PREFIX}${ip}`;

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      try {
        return JSON.parse(cached) as Geo;
      } catch {
        // corrupt cache entry: fall through to a live lookup
      }
    }
  } catch {
    // redis unavailable: degrade to a live lookup
  }

  const pending = inFlight.get(ip);
  if (pending) return pending;

  const lookup = (async (): Promise<Geo | null> => {
    if (Date.now() < openUntil) return null;

    const geo = await lookupIpdata(ip);

    if (geo) {
      try {
        await redis.set(
          cacheKey,
          JSON.stringify(geo),
          "EX",
          CACHE_TTL_SECONDS,
        );
      } catch {
        // cache writes are best-effort
      }
    }

    return geo;
  })();

  inFlight.set(ip, lookup);

  try {
    return await lookup;
  } finally {
    inFlight.delete(ip);
  }
};

export const getGeo: RequestHandler = async (req, res) => {
  const { ip, overrideUsed } = getClientIp(req);

  if (!ip || isPrivateIp(ip)) {
    res.status(204).end();
    return;
  }

  const userAgent = req.headers["user-agent"] ?? "";

  if (!overrideUsed && BOT_UA.test(userAgent)) {
    res.status(204).end();
    return;
  }

  const geo = await resolveGeo(ip);

  if (!geo) {
    res.status(503).json({ success: false, message: "Geo lookup unavailable" });
    return;
  }

  res.setHeader("Cache-Control", "private, no-store");
  res.status(200).json(geo);
};
