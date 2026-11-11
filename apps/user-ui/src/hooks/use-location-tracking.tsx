"use client";
import { useEffect, useState } from "react";

type TrackedLocation = {
  country: string;
  city: string;
};

const LOCATION_STORAGE_KEY = "user_location_v2";
const LOCATION_TTL = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT = 3000;

let inFlight: Promise<TrackedLocation | null> | null = null;

const readStoredLocation = (): TrackedLocation | null => {
  if (typeof window === "undefined") return null;

  try {
    const storedData = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!storedData) return null;

    const parsed = JSON.parse(storedData);
    if (
      typeof parsed?.country !== "string" ||
      !parsed.country ||
      typeof parsed?.city !== "string" ||
      !parsed.city ||
      typeof parsed?.timestamp !== "number"
    ) {
      return null;
    }

    if (Date.now() - parsed.timestamp > LOCATION_TTL) return null;

    return { country: parsed.country, city: parsed.city };
  } catch {
    return null;
  }
};

const requestLocation = (): Promise<TrackedLocation | null> => {
  if (inFlight) return inFlight;

  inFlight = fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/geo`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    cache: "no-store",
  })
    .then(async (res) => {
      if (res.status === 204 || !res.ok) return null;

      const data = await res.json();
      if (typeof data?.country !== "string" || !data.country) return null;

      const location: TrackedLocation = {
        country: data.country,
        city: data.city || "Unknown",
      };

      try {
        localStorage.setItem(
          LOCATION_STORAGE_KEY,
          JSON.stringify({ ...location, timestamp: Date.now() }),
        );
      } catch {
        // Ignore storage failures (private mode, quota, etc.)
      }

      return location;
    })
    .catch(() => null)
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};

export const useLocationTracking = () => {
  const [location, setLocation] = useState<TrackedLocation | null | undefined>(
    undefined,
  );

  useEffect(() => {
    let active = true;

    const stored = readStoredLocation();
    if (stored) {
      setLocation(stored);
      return;
    }

    requestLocation().then((next) => {
      if (active) setLocation(next);
    });

    return () => {
      active = false;
    };
  }, []);

  return location;
};
