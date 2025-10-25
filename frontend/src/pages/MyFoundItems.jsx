// src/pages/MyFoundItems.jsx
// Shows only the found items created by the logged-in user.
// Backend route: GET /api/items/found/my
// Also has Delete button.

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ItemCard from "../Components/ItemCard";

export default function MyFoundItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/items/found/my");
        setItems(res.data || []);
      } catch (e) {
        console.error("Failed to load my found items", e);
        setErr(e.response?.data?.message || e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/items/found/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id && i.id !== id));
      alert("Item deleted successfully.");
    } catch (e) {
      console.error("Delete failed", e);
      alert(e.response?.data?.message || e.message || "Failed to delete");
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Found Items</h1>

      {loading && <div>Loading...</div>}
      {err && <div className="text-red-600">{err}</div>}

      {!loading && !err && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">You haven’t posted any found items yet.</div>
          ) : (
            items.map((it) => (
              <div key={it._id || it.id} className="relative">
                <ItemCard item={it} type="found" />
                <button
                  onClick={() => handleDelete(it._id || it.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <Link to={`/items/edit/found/${it._id || it.id}`} className="absolute top-2 right-14 bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700">
                  Edit
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}