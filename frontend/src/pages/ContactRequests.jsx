// src/pages/ContactRequests.jsx
// ------------------------------------------------------------
// Finder ke liye inbox: unke found items par aayi requests
// Routes used:
//   GET  /api/contact-requests/mine
//   POST /api/contact-requests/:id/approve
//   POST /api/contact-requests/:id/decline
// ------------------------------------------------------------
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import ApproveContactModal from "../Components/ApproveContactModal";

export default function ContactRequests() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selected, setSelected] = useState(null); // approve modal

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get("/contact-requests/mine");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Failed to load";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function decline(id) {
    if (!window.confirm("Decline this contact request?")) return;
    try {
      await api.post(`/contact-requests/${id}/decline`);
      setRows(prev => prev.map(r => (r._id === id ? { ...r, status: "declined" } : r)));
    } catch (e) {
      alert(e?.response?.data?.message || "Decline failed");
    }
  }

  function onApproved(updated) {
    if (!updated) return;
    setRows(prev => prev.map(r => (r._id === updated._id ? updated : r)));
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold">Contact Requests</h1>
        <button onClick={load} className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50">Refresh</button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading…</div>
      ) : err ? (
        <div className="text-red-600">{err}</div>
      ) : rows.length === 0 ? (
        <div className="p-10 text-center border rounded-xl">
          <div className="text-lg font-medium">No requests</div>
          <div className="text-sm text-gray-500">You’ll see requests here when people want to contact you.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map(r => (
            <div key={r._id} className="border rounded-xl p-3 md:p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm">
                    <span className="font-medium">{r.requester?.name || "User"}</span>{" "}
                    requested contact for <span className="font-medium">“{r.foundItem?.itemName || 'item'}”</span>
                  </div>
                  <div className="text-xs text-gray-500">Status: {r.status}</div>
                  {r.message && <div className="text-sm text-gray-700 mt-1">Message: {r.message}</div>}
                </div>

                <div className="flex items-center gap-2">
                  {r.status === "pending" ? (
                    <>
                      <button
                        onClick={() => setSelected(r)}
                        className="text-xs px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => decline(r._id)}
                        className="text-xs px-3 py-1.5 border rounded hover:bg-gray-50"
                      >
                        Decline
                      </button>
                    </>
                  ) : r.status === "accepted" ? (
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">Accepted</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">Declined</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ApproveContactModal
        open={!!selected}
        onClose={() => setSelected(null)}
        request={selected}
        onApproved={onApproved}
      />
    </div>
  );
}
