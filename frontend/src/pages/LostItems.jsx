// src/pages/LostItems.jsx
// Public page listing all lost items.
// Calls GET /api/items/lost
// Uses ItemCard to render each item.

import React, { useEffect, useState } from "react";
import api from "../api/axios";  // axios instance with baseURL
import ItemCard from "../Components/ItemCard";

export default function LostItems() {
  // State for items, loading spinner, and errors
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    // load items when component mounts
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/items/lost"); // backend endpoint
        setItems(res.data || []);
      } catch (e) {
        console.error("Failed to load lost items", e);
        setErr(e.response?.data?.message || e.message || "Failed to load lost items");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Lost Items</h1>
        <p className="text-sm text-gray-500">Yahan wo items list hote hain jo users ne lost mark kiya hai.</p>
      </div>

      {/* Loading spinner */}
      {loading && <div className="text-center py-8">Loading...</div>}

      {/* Error message */}
      {err && <div className="text-red-600 bg-red-50 p-3 rounded">{err}</div>}

      {/* List */}
      {!loading && !err && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">No lost items yet.</div>
          ) : (
            items.map((it) => <ItemCard key={it.id || it._id} item={it} type="lost" />)
          )}
        </div>
      )}
    </div>
  );
}