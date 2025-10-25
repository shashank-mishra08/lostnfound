// src/Components/RecentItems.jsx
// Fetch recent lost + found items and show a unified grid (latest 6).
// - Tries GET /api/items/lost and /api/items/found in parallel with { limit: 12 } as hint.
// - Combines results, sorts by createdAt (desc) and shows top 6.
// - Uses existing api axios instance and respects image host logic similar to ItemDetail.
//
// Usage: <RecentItems maxItems={6} />
// ------------------------------------------------------------
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function RecentItems({ maxItems = 6 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const apiHost = import.meta.env.VITE_API_HOST || "";

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        // Ask backend for some recent items (limit is a hint; backend may or may not honor)
        // We request a bit more (12) so that after merging we can pick top `maxItems`.
        const params = { params: { limit: 12 } };

        const [lostRes, foundRes] = await Promise.allSettled([
          api.get("/items/lost", params),
          api.get("/items/found", params)
        ]);

        const lostItems = (lostRes.status === "fulfilled" && Array.isArray(lostRes.value.data)) ? lostRes.value.data : [];
        const foundItems = (foundRes.status === "fulfilled" && Array.isArray(foundRes.value.data)) ? foundRes.value.data : [];

        // Normalize to unified shape
        const normalized = [
          ...lostItems.map(it => ({ ...it, _type: "lost" })),
          ...foundItems.map(it => ({ ...it, _type: "found" }))
        ];

        // sort by createdAt (fallback to date fields) desc
        normalized.sort((a, b) => {
          const ta = new Date(a.createdAt || a.lostDate || a.foundDate || 0).getTime();
          const tb = new Date(b.createdAt || b.lostDate || b.foundDate || 0).getTime();
          return tb - ta;
        });

        // take top maxItems
        const top = normalized.slice(0, maxItems);

        if (!mounted) return;
        setItems(top);
      } catch (e) {
        console.error("RecentItems load error:", e);
        if (mounted) setErr("Failed to load recent items");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [maxItems]);

  function imageUrl(item) {
    if (!item || !item.image) return null;
    if (String(item.image).startsWith("http")) return item.image;
    return `${apiHost}/${item.image}`;
  }

  if (loading) {
    return (
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: Math.min(6, maxItems) }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-3 animate-pulse">
            <div className="h-36 bg-gray-100 rounded mb-3" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (err) {
    return <div className="mt-4 text-sm text-red-600">{err}</div>;
  }

  if (!items || items.length === 0) {
    return <div className="mt-4 text-sm text-gray-500">No recent reports yet.</div>;
  }

  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(it => (
        <Link
          key={it._id}
          to={`/items/${it._type}/${it._id}`}
          className="bg-white rounded-lg shadow hover:shadow-md transition p-3 flex flex-col"
        >
          <div className="h-36 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
            {imageUrl(it) ? (
              <img src={imageUrl(it)} alt={it.itemName} className="object-cover w-full h-full" />
            ) : (
              <div className="text-gray-400">No image</div>
            )}
          </div>

          <div className="mt-3 flex-1">
            <div className="font-medium">{it.itemName || "Untitled item"}</div>
            <div className="text-xs text-gray-500 mt-1">
              {it._type === "lost" ? "Lost" : "Found"} •{" "}
              { (it.lostLocation?.address || it.foundLocation?.address) ? (it.lostLocation?.address || it.foundLocation?.address) : '-' }
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
            <div>{new Date(it.lostDate || it.foundDate || it.createdAt).toLocaleDateString()}</div>
            <div className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">{it._type}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
