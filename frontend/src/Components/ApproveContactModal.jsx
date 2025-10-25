// src/Components/ApproveContactModal.jsx
// ------------------------------------------------------------
// Purpose: Finder ko decide karne dena ki kya share karna hai (email/phone/note)
// Props:
//   open, onClose
//   request (ContactRequest doc): {_id, foundItem, requester{ name,email }, ...}
//   onApproved: (updatedRequest) => void  // parent list ko update karne ke liye
// ------------------------------------------------------------
import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function ApproveContactModal({ open, onClose, request, onApproved }) {
  const [email, setEmail]   = useState("");
  const [phone, setPhone]   = useState("");
  const [note, setNote]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    // Modal open hote hi defaults reset
    if (open) {
      setEmail("");
      setPhone("");
      setNote("");
      setErr("");
    }
  }, [open]);

  if (!open || !request) return null;

  async function handleApprove() {
    setErr("");
    try {
      setSubmitting(true);
      // Backend: POST /api/contact-requests/:id/approve  { email?, phone?, note? }
      const { data } = await api.post(`/contact-requests/${request._id}/approve`, { email, phone, note });
      alert(data?.message || "Approved");
      onApproved?.(data?.request || null);
      onClose?.();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Failed to approve";
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5 space-y-3">
        <div className="text-lg font-semibold">Share contact for “{request?.foundItem?.itemName || 'item'}”</div>
        <div className="text-xs text-gray-600">
          Requester: <span className="font-medium">{request?.requester?.name || 'User'}</span> ({request?.requester?.email || '—'})
        </div>

        <div className="grid grid-cols-1 gap-2">
          <label className="text-sm">
            <span className="block text-gray-700 mb-1">Email to share</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Leave blank to share your profile email (if any)"
              className="w-full border rounded-lg p-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="block text-gray-700 mb-1">Phone to share</span>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Optional phone number"
              className="w-full border rounded-lg p-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="block text-gray-700 mb-1">Note</span>
            <textarea
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Any instruction for requester (e.g., call after 6pm)"
              className="w-full border rounded-lg p-2 text-sm"
            />
          </label>
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50" disabled={submitting}>
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={submitting}
            className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
          >
            {submitting ? "Sharing…" : "Share contact"}
          </button>
        </div>
      </div>
    </div>
  );
}
