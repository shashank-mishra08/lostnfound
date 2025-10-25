// src/pages/MyContactRequests.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function MyContactRequests() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get("/contact-requests/my-requests");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold">My Contact Requests</h1>
        <button onClick={load} className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50">Refresh</button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading…</div>
      ) : err ? (
        <div className="text-red-600">{err}</div>
      ) : rows.length === 0 ? (
        <div className="p-10 text-center border rounded-xl">
          <div className="text-lg font-medium">No requests sent yet</div>
          <div className="text-sm text-gray-500">Visit a found item and tap “Request contact”.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map(r => (
            <div key={r._id} className="border rounded-xl p-3 md:p-4">
              <div className="text-sm">
                You requested contact for <span className="font-medium">“{r.foundItem?.itemName || 'item'}”</span>
              </div>
              <div className="text-xs text-gray-500">Status: {r.status}</div>
              {r.status === "accepted" && (
                <div className="mt-2 text-xs text-green-700">Approved — check your Notifications for contact details.</div>
              )}
              {r.status === "declined" && (
                <div className="mt-2 text-xs text-red-700">Declined by finder.</div>
              )}
              {r.message && <div className="text-sm text-gray-700 mt-1">Your message: {r.message}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
