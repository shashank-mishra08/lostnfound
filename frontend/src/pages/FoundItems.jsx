// src/pages/FoundItems.jsx
// Public page listing all found items.
// Calls GET /api/items/found
// Uses ItemCard to render each item.

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import ItemCard from "../Components/ItemCard";

export default function FoundItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    // load data on mount
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/items/found"); // backend endpoint
        // backend returns array of publicItems: { id, itemName, description, ... }
        setItems(res.data || []);
      } catch (e) {
        console.error("Failed to load found items", e);
        setErr(e.response?.data?.message || e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Found Items</h1>
        <p className="text-sm text-gray-500">Yahan log jo kuchh milte hain wo report karte hain — browse karein.</p>
      </div>

      {loading && <div className="text-center py-8">Loading...</div>}

      {err && <div className="text-red-600 bg-red-50 p-3 rounded">{err}</div>}

      {!loading && !err && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">No found items yet.</div>
          ) : (
            items.map((it) => <ItemCard key={it.id || it._id} item={it} type="found" />)
          )}
        </div>
      )}
    </div>
  );
}