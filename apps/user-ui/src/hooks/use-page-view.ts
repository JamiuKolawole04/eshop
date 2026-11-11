"use client";

import { useEffect } from "react";

import { sendKafkaEvents } from "@/actions/track-user";
import { useLocationTracking } from "@/hooks/use-location-tracking";

const VISITOR_STORAGE_KEY = "eshop_visitor_id";

const getVisitorId = () => {
  try {
    const existing = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing) return existing;

    const id = crypto.randomUUID();
    localStorage.setItem(VISITOR_STORAGE_KEY, id);
    return id;
  } catch {
    return `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};

export const usePageView = (page: string) => {
  const location = useLocationTracking();

  useEffect(() => {
    if (location === undefined) return;

    const guardKey = `page_view_sent:${page}`;

    try {
      if (sessionStorage.getItem(guardKey)) return;
      sessionStorage.setItem(guardKey, "1");
    } catch {
      // If sessionStorage is unavailable we still send the event.
    }

    sendKafkaEvents({
      action: "page_view",
      page,
      visitorId: getVisitorId(),
      country: location?.country || "Unknown",
      city: location?.city || "Unknown",
    });
  }, [location, page]);
};
