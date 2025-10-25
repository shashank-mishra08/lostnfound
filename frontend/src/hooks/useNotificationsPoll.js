// frontend/src/hooks/useNotificationsPoll.js
// ------------------------------------------------------------
// PURPOSE:
// - Navbar bell ke liye unread notifications count laana
// - Light polling (default: 30s) + tab focus/blur respect
// - Auth token to already axios instance me set hai (api/axios.js)
//
// USAGE:
// const { unread, loading, refresh } = useNotificationsPoll(30000);
// ------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/axios";

export default function useNotificationsPoll(intervalMs = 30000) {
  // unread = unread notifications count
  const [unread, setUnread] = useState(0);
  // loading = first fetch spinner control (Navbar me optional use)
  const [loading, setLoading] = useState(true);
  // mountedRef = race conditions aur unmounted setState avoid
  const mountedRef = useRef(false);
  // timerRef = setInterval id store
  const timerRef = useRef(null);

  // ---- core fetcher: GET /api/notifications, then count unread ----
  const fetchUnread = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      // optional: initial load ko hi loading dikhana kaafi hota
      const { data } = await api.get("/notifications");
      const rows = Array.isArray(data) ? data : [];
      // unread = read === false
      const count = rows.filter(n => !n.read).length;
      if (mountedRef.current) setUnread(count);
    } catch (e) {
      // NOTE: production me ye log ko throttle/disable karna
      console.warn("[notif] fetch failed:", e?.response?.data?.message || e.message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // ---- public: manual refresh (e.g., mark-all-read ke baad) ----
  const refresh = useCallback(() => {
    // intentionally no setLoading(true) to avoid navbar jump
    fetchUnread();
  }, [fetchUnread]);

  // ---- lifecycle: mount/unmount ----
  useEffect(() => {
    mountedRef.current = true;
    // initial fetch
    fetchUnread();

    // polling: only when tab is focused (see visibility handler below)
    const startPolling = () => {
      if (timerRef.current) return;
      timerRef.current = setInterval(fetchUnread, intervalMs);
    };
    const stopPolling = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    // start immediately if visible
    if (document.visibilityState === "visible") startPolling();

    // page visibility handler: focus = start, blur = stop
    const onVis = () => {
      if (document.visibilityState === "visible") startPolling();
      else stopPolling();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      mountedRef.current = false;
      document.removeEventListener("visibilitychange", onVis);
      stopPolling();
    };
  }, [fetchUnread, intervalMs]);

  return { unread, loading, refresh };
}
