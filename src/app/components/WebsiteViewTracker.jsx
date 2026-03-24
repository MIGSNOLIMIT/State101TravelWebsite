"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VISITOR_STORAGE_KEY = "state101-visitor-id";
const IGNORED_PATHS = new Set(["/access-denied"]);

function getVisitorId() {
  if (typeof window === "undefined") return "";

  let visitorId = window.localStorage.getItem(VISITOR_STORAGE_KEY);
  if (!visitorId) {
    visitorId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
  }

  return visitorId;
}

export default function WebsiteViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || IGNORED_PATHS.has(pathname)) {
      return;
    }

    const visitorId = getVisitorId();
    if (!visitorId) return;

    fetch("/api/analytics/website-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}